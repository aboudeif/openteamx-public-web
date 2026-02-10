import { useState } from "react";
import { WorkspaceLayout } from "@/components/layout/WorkspaceLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  Video, 
  Lightbulb,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

const categories = [
  { id: 1, name: "Getting Started", icon: Book, count: 12, color: "bg-primary/10 text-primary" },
  { id: 2, name: "Teams & Collaboration", icon: MessageCircle, count: 18, color: "bg-success/10 text-success" },
  { id: 3, name: "Billing & Payments", icon: Lightbulb, count: 8, color: "bg-warning/10 text-warning" },
  { id: 4, name: "Video Tutorials", icon: Video, count: 24, color: "bg-info/10 text-info" },
];

const popularArticles = [
  { id: 1, title: "How to create your first team", category: "Getting Started", views: "2.4k" },
  { id: 2, title: "Understanding team roles and permissions", category: "Teams & Collaboration", views: "1.8k" },
  { id: 3, title: "Managing your wallet and rewards", category: "Billing & Payments", views: "1.5k" },
  { id: 4, title: "Connecting external integrations", category: "Getting Started", views: "1.2k" },
  { id: 5, title: "Using the project management features", category: "Teams & Collaboration", views: "980" },
  { id: 6, title: "Setting up your talent profile", category: "Getting Started", views: "876" },
];

export default function TalentHelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <WorkspaceLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">How can we help?</h1>
          <p className="text-muted-foreground mb-6">Search our knowledge base or browse categories below</p>
          
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-4">Browse Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                className="p-4 rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/20 transition-all text-left group"
              >
                <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center mb-3`}>
                  <category.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.count} articles</p>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-4">Popular Articles</h2>
          <div className="space-y-2">
            {popularArticles.map((article) => (
              <button
                key={article.id}
                className="w-full p-4 rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/20 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Book className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium group-hover:text-primary transition-colors">{article.title}</h3>
                    <p className="text-sm text-muted-foreground">{article.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{article.views} views</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="p-6 rounded-xl border border-border bg-card text-center">
          <h2 className="text-lg font-semibold mb-2">Still need help?</h2>
          <p className="text-muted-foreground mb-4">Our support team is ready to assist you</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Chat
            </Button>
            <Button>
              Contact Support
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
