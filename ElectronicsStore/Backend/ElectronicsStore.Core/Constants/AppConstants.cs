namespace ElectronicsStore.Core.Constants
{
    public static class AppConstants
    {
        public static class Roles
        {
            public const string Admin = "Admin";
            public const string Customer = "Customer";
            public const string Manager = "Manager";
        }

        public static class Policies
        {
            public const string RequireAdminRole = "RequireAdminRole";
            public const string RequireCustomerRole = "RequireCustomerRole";
            public const string RequireManagerRole = "RequireManagerRole";
        }

        public static class JwtClaims
        {
            public const string UserId = "userId";
            public const string Email = "email";
            public const string FirstName = "firstName";
            public const string LastName = "lastName";
        }

        public static class CacheKeys
        {
            public const string FeaturedProducts = "featured_products";
            public const string Categories = "categories";
            public const string Brands = "brands";
            public const string ProductDetails = "product_details_{0}";
        }

        public static class EmailTemplates
        {
            public const string WelcomeEmail = "WelcomeEmail";
            public const string OrderConfirmation = "OrderConfirmation";
            public const string OrderShipped = "OrderShipped";
            public const string OrderDelivered = "OrderDelivered";
            public const string PasswordReset = "PasswordReset";
            public const string EmailConfirmation = "EmailConfirmation";
        }

        public static class NotificationMessages
        {
            public const string OrderPlaced = "Your order #{0} has been placed successfully.";
            public const string OrderConfirmed = "Your order #{0} has been confirmed and is being processed.";
            public const string OrderShipped = "Your order #{0} has been shipped. Tracking number: {1}";
            public const string OrderDelivered = "Your order #{0} has been delivered successfully.";
            public const string PaymentCompleted = "Payment for order #{0} has been completed successfully.";
            public const string PaymentFailed = "Payment for order #{0} has failed. Please try again.";
        }

        public static class IndianStates
        {
            public static readonly List<string> States = new()
            {
                "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
                "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
                "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
                "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
                "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
                "Uttarakhand", "West Bengal", "Jammu and Kashmir", "Ladakh",
                "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep",
                "Puducherry", "Andaman and Nicobar Islands"
            };
        }

        public static class Currency
        {
            public const string Symbol = "₹";
            public const string Code = "INR";
        }

        public static class Tax
        {
            public const decimal GST_Rate = 0.18m; // 18% GST
            public const decimal DefaultShippingRate = 50.0m;
            public const decimal FreeShippingThreshold = 999.0m;
        }
    }
}