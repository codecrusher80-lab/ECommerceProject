import React, { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addNotification } from '../../store/slices/notificationSlice';
import { updateOrder } from '../../store/slices/orderSlice';
import { API_BASE_URL } from '../../constants';

interface SignalRConnectionProps {
  userId: string;
}

const SignalRConnection: React.FC<SignalRConnectionProps> = ({ userId }) => {
  const dispatch = useDispatch();
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    // Create SignalR connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL.replace('/api', '')}/notificationHub`, {
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    // Start the connection
    const startConnection = async () => {
      try {
        await connection.start();
        console.log('SignalR connection established');

        // Join user-specific group
        await connection.invoke('JoinUserGroup', userId);

        // Set up event listeners
        connection.on('ReceiveNotification', (notification) => {
          dispatch(addNotification(notification));
          
          // Show toast notification
          toast.info(notification.title, {
            onClick: () => {
              if (notification.actionUrl) {
                window.location.href = notification.actionUrl;
              }
            },
          });
        });

        connection.on('OrderStatusUpdated', (order) => {
          dispatch(updateOrder(order));
          
          // Show toast notification for order updates
          toast.success(`Order ${order.orderNumber} status updated to ${order.status}`, {
            onClick: () => {
              window.location.href = `/orders/${order.id}`;
            },
          });
        });

        connection.on('PaymentStatusUpdated', (paymentInfo) => {
          // Handle payment status updates
          if (paymentInfo.status === 'Completed') {
            toast.success(`Payment completed for order ${paymentInfo.orderNumber}`, {
              onClick: () => {
                window.location.href = `/orders/${paymentInfo.orderId}`;
              },
            });
          } else if (paymentInfo.status === 'Failed') {
            toast.error(`Payment failed for order ${paymentInfo.orderNumber}`, {
              onClick: () => {
                window.location.href = `/orders/${paymentInfo.orderId}`;
              },
            });
          }
        });

        connection.on('InventoryAlert', (alertInfo) => {
          // Handle inventory alerts (for admin users)
          toast.warning(`Low inventory alert: ${alertInfo.productName} (${alertInfo.remainingStock} left)`, {
            onClick: () => {
              window.location.href = `/admin/products/${alertInfo.productId}`;
            },
          });
        });

      } catch (error) {
        console.error('SignalR connection error:', error);
        
        // Retry connection after 5 seconds
        setTimeout(() => {
          startConnection();
        }, 5000);
      }
    };

    startConnection();

    // Cleanup on unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.invoke('LeaveUserGroup', userId).catch(console.error);
        connectionRef.current.stop().catch(console.error);
      }
    };
  }, [userId, dispatch]);

  // Handle connection state changes
  useEffect(() => {
    const connection = connectionRef.current;
    if (connection) {
      connection.onreconnecting(() => {
        console.log('SignalR reconnecting...');
      });

      connection.onreconnected(() => {
        console.log('SignalR reconnected');
        // Rejoin user group after reconnection
        connection.invoke('JoinUserGroup', userId).catch(console.error);
      });

      connection.onclose(() => {
        console.log('SignalR connection closed');
      });
    }
  }, [userId]);

  return null; // This component doesn't render anything
};

export default SignalRConnection;