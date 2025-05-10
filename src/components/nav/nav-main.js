"use client";

import { ChevronRight, Home, Star, User } from "lucide-react"; // Import icons

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

export function NavMain({ navItems, playlistItems }) {
  return (
    <>
      {/* New Navigation Section */}
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Home" asChild>
              <a href="/home">
                <Home className="mr-2 h-5 w-5" /> {/* Add Home icon */}
                <span className="font-semibold">Home</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Ratings" asChild>
              <a href="/ratings">
                <Star className="mr-2 h-5 w-5" /> {/* Add Ratings icon */}
                <span className="font-semibold">Ratings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Profile" asChild>
              <a href="/profile">
                <User className="mr-2 h-5 w-5" /> {/* Add Profile icon */}
                <span className="font-semibold">Profile</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Profile" asChild>
              <a href="/rank">
                <User className="mr-2 h-5 w-5" /> {/* Add Profile icon */}
                <span className="font-semibold">Rank</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Ratings" asChild>
              <a href="/artist-ranking">
                <Star className="mr-2 h-5 w-5" /> {/* Add Ratings icon */}
                <span className="font-semibold">Artist Rankings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* Platform Section */}
      <SidebarGroup>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>
          {/* Render regular navigation items */}
          {navItems.map((item) => (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon className="mr-2 h-5 w-5" />}{" "}
                    {/* Render icon */}
                    <span className="font-semibold">{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem, index) => (
                      <SidebarMenuSubItem
                        key={subItem.id || subItem.title || index}
                      >
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>{subItem.title}</a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}

          {/* Render playlist items */}
          {playlistItems.map((playlistSection) => (
            <Collapsible
              key={playlistSection.title}
              asChild
              defaultOpen={false}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={playlistSection.title}>
                    {playlistSection.icon && (
                      <playlistSection.icon className="mr-2 h-5 w-5" />
                    )}{" "}
                    {/* Render icon */}
                    <span className="font-semibold">
                      {playlistSection.title}
                    </span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {playlistSection.items.map((subItem, index) => (
                      <SidebarMenuSubItem key={subItem.title || index}>
                        <div className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm hover:bg-gray-50">
                          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                            {subItem.imageUrl && (
                              <img
                                src={subItem.imageUrl}
                                alt={subItem.title}
                                className="h-11 w-11 rounded-lg object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-auto">
                            <a
                              href={subItem.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block font-semibold text-gray-900"
                            >
                              {subItem.title}
                            </a>
                          </div>
                        </div>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
