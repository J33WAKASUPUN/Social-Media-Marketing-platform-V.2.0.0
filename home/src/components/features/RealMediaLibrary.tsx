import { motion } from "framer-motion";
import { Play } from "lucide-react";

const mediaItems = [
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    platform: "Instagram",
  },
  {
    type: "video",
    url: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&h=400&fit=crop",
    platform: "YouTube",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop",
    platform: "Facebook",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop",
    platform: "Twitter",
  },
  
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=400&fit=crop", // Stormy Coast
    platform: "Behance",
  },

  {
    type: "image",
    url: "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=400&h=400&fit=crop",
    platform: "LinkedIn",
  },

 {
    type: "image",
    url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&h=400&fit=crop", // Deep Forest
    platform: "Snapchat",
  },

  {
    type: "image",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
    platform: "Snapchat",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=400&fit=crop",
    platform: "Reddit",
  },
];

export function RealMediaLibrary() {
  return (
    <div className="mt-5 flex flex-col justify-between min-h-[200px]">
      {/* Grid - Takes more space */}
      <div className="grid grid-cols-3 gap-2 flex-1">
        {mediaItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer bg-gradient-to-br shadow-sm"
          >
            <img
              src={item.url}
              alt={`Media ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              {item.type === "video" && (
                <motion.div
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-lg"
                >
                  <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                </motion.div>
              )}
            </div>

            {/* Platform Badge */}
            <div className="absolute top-1.5 right-1.5 bg-black/80 backdrop-blur-sm text-white text-[8px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              {item.platform}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
        <span>1,250 files • 8.3 GB used</span>
        <button className="text-pink-500 font-semibold hover:underline transition-all">
          + Upload
        </button>
      </div>
    </div>
  );
}