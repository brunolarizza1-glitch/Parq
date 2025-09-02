export default function FeaturesSection() {
  return (
    <section id="features" className="bg-muted py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Why choose Parq?</h2>
          <p className="text-xl text-muted-foreground">Safe, convenient, and affordable parking solutions</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-shield-alt text-primary text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Verified & Secure</h3>
            <p className="text-muted-foreground">All parking spaces are verified and many feature 24/7 security monitoring</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-mobile-alt text-primary text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Instant Booking</h3>
            <p className="text-muted-foreground">Book parking spaces instantly with our mobile app - no waiting required</p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-dollar-sign text-primary text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Best Prices</h3>
            <p className="text-muted-foreground">Save up to 50% compared to traditional parking with our competitive rates</p>
          </div>
        </div>
      </div>
    </section>
  );
}
