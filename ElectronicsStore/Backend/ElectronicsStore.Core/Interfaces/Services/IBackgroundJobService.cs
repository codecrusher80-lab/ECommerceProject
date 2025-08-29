namespace ElectronicsStore.Core.Interfaces.Services
{
    public interface IBackgroundJobService
    {
        void ScheduleEmailJob(string jobId, string emailType, object emailData, TimeSpan delay);
        void ScheduleInventoryUpdateJob(string jobId, int productId, TimeSpan delay);
        void ScheduleOrderProcessingJob(string jobId, int orderId, TimeSpan delay);
        void ScheduleAnalyticsUpdateJob(string jobId, TimeSpan delay);
        void ScheduleCleanupJob(string jobId, TimeSpan delay);
        void CancelJob(string jobId);
        void RecurringInventoryCheck();
        void RecurringAnalyticsUpdate();
        void RecurringCleanup();
    }
}