import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { ArrowLeft, Search, Calendar, Clock, User, ArrowRight } from "lucide-react";
import Footer from "@/components/footer";
import { useState } from "react";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "All Posts",
    "Product Updates", 
    "City Guides",
    "Host Tips",
    "Driver Resources",
    "Company News"
  ];

  const featuredPost = {
    id: 1,
    title: "The Future of Urban Parking: How Technology is Solving City Congestion",
    excerpt: "Exploring how smart parking solutions are transforming urban mobility and reducing traffic congestion in major cities worldwide.",
    author: "Sarah Johnson",
    date: "December 15, 2024",
    readTime: "8 min read",
    category: "City Guides",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=400&fit=crop",
    featured: true
  };

  const blogPosts = [
    {
      id: 2,
      title: "5 Tips to Maximize Your Parking Space Earnings",
      excerpt: "Learn proven strategies to increase bookings and optimize your pricing for maximum revenue.",
      author: "Mike Chen",
      date: "December 12, 2024", 
      readTime: "5 min read",
      category: "Host Tips",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop"
    },
    {
      id: 3,
      title: "Parq Mobile App Update: New GPS Features",
      excerpt: "Discover the latest features in our mobile app that make finding parking even easier.",
      author: "Emily Rodriguez",
      date: "December 10, 2024",
      readTime: "3 min read", 
      category: "Product Updates",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop"
    },
    {
      id: 4,
      title: "Best Neighborhoods for Parking in San Francisco",
      excerpt: "A comprehensive guide to parking availability and pricing across SF neighborhoods.",
      author: "David Park",
      date: "December 8, 2024",
      readTime: "7 min read",
      category: "City Guides", 
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop"
    },
    {
      id: 5,
      title: "How to Find Parking for Special Events",
      excerpt: "Pro tips for securing parking during concerts, sports games, and major city events.",
      author: "Lisa Wang",
      date: "December 5, 2024",
      readTime: "6 min read",
      category: "Driver Resources",
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=250&fit=crop"
    },
    {
      id: 6,
      title: "Parq's Series A Funding: What's Next",
      excerpt: "How our recent funding will accelerate growth and improve the platform experience.",
      author: "Alex Thompson",
      date: "December 1, 2024",
      readTime: "4 min read",
      category: "Company News",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop"
    },
    {
      id: 7,
      title: "Winter Parking Tips: Protecting Your Space",
      excerpt: "Essential advice for hosts to maintain their parking spaces during winter weather.",
      author: "Jennifer Lee",
      date: "November 28, 2024",
      readTime: "5 min read",
      category: "Host Tips",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Parq Blog</h1>
          <p className="text-xl opacity-90 mb-8">
            Insights, tips, and news from the world of smart parking.
          </p>
          
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="py-8 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Badge
                key={index}
                variant={index === 0 ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Featured Article</h2>
          
          <Card className="overflow-hidden hover:shadow-xl transition-shadow">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <Badge className="mb-4">{featuredPost.category}</Badge>
                <h3 className="text-2xl font-bold mb-4">{featuredPost.title}</h3>
                <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                
                <div className="flex items-center text-sm text-muted-foreground mb-6">
                  <User className="w-4 h-4 mr-1" />
                  <span className="mr-4">{featuredPost.author}</span>
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="mr-4">{featuredPost.date}</span>
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{featuredPost.readTime}</span>
                </div>
                
                <Button>
                  Read Article
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="py-16 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Recent Articles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-3">{post.category}</Badge>
                  <h3 className="text-lg font-semibold mb-3 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                  
                  <div className="flex items-center text-xs text-muted-foreground mb-4">
                    <User className="w-3 h-3 mr-1" />
                    <span className="mr-3">{post.author}</span>
                    <Calendar className="w-3 h-3 mr-1" />
                    <span className="mr-3">{post.date}</span>
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{post.readTime}</span>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    Read More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 opacity-90">
            Get the latest parking tips, product updates, and industry insights delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white text-gray-900"
            />
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              Subscribe
            </Button>
          </div>
          <p className="text-sm opacity-75 mt-4">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}