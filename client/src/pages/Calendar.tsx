import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { mockPosts } from "@/lib/mockData";
import { PlatformBadge } from "@/components/PlatformBadge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const getPostsForDate = (date: number) => {
    return mockPosts.filter((post) => post.status === "scheduled").slice(0, 2);
  };

  const handleDateClick = (date: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), date));
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-[100px] border bg-muted/30" />);
    }
    
    // Days of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const posts = getPostsForDate(date);
      const isToday = date === new Date().getDate() && 
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();
      
      days.push(
        <Card
          key={date}
          className="group min-h-[100px] cursor-pointer p-2 transition-all hover:shadow-lg hover:ring-2 hover:ring-primary"
          onClick={() => handleDateClick(date)}
        >
          <div className="flex items-center justify-between">
            <span className={`text-sm font-semibold ${isToday ? "text-primary" : ""}`}>
              {date}
            </span>
            {posts.length > 0 && (
              <Badge variant="outline" className="h-5 px-1 text-xs">
                {posts.length}
              </Badge>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {posts.slice(0, 2).map((post) => (
              <div key={post.id} className="flex gap-0.5">
                {post.platforms.slice(0, 2).map((platform) => (
                  <div
                    key={platform}
                    className={`h-2 w-2 rounded-full ${
                      platform === "linkedin"
                        ? "bg-[#0077B5]"
                        : platform === "facebook"
                        ? "bg-[#1877F2]"
                        : platform === "twitter"
                        ? "bg-[#1DA1F2]"
                        : "bg-[#E4405F]"
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </Card>
      );
    }
    
    return days;
  };

  const selectedDatePosts = selectedDate ? mockPosts.filter((p) => p.status === "scheduled") : [];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Calendar"
        description="View and manage your scheduled posts"
      />

      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={today}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
          {renderCalendarDays()}
        </div>
      </Card>

      <Sheet open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>
              Posts on {selectedDate?.toLocaleDateString("en-US", { 
                month: "long", 
                day: "numeric", 
                year: "numeric" 
              })}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {selectedDatePosts.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">No posts scheduled for this day</p>
            ) : (
              selectedDatePosts.map((post) => (
                <Card key={post.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{post.scheduledDate}</span>
                      <div className="flex gap-1">
                        {post.platforms.map((platform) => (
                          <PlatformBadge key={platform} platform={platform} size="sm" showIcon={false} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
