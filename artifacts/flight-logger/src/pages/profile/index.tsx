import { useGetProfile, useUpdateProfile, getGetProfileQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  homeAirport: z.string().optional(),
  bio: z.string().optional(),
  avatarInitials: z.string().max(2).optional(),
});

export default function ProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useGetProfile({ query: { queryKey: getGetProfileQueryKey() } });
  const updateProfile = useUpdateProfile();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      homeAirport: "",
      bio: "",
      avatarInitials: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        homeAirport: profile.homeAirport || "",
        bio: profile.bio || "",
        avatarInitials: profile.avatarInitials || "",
      });
    }
  }, [profile, form]);

  function onSubmit(values: z.infer<typeof profileSchema>) {
    updateProfile.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(getGetProfileQueryKey(), data);
          toast({ title: "Profile updated successfully" });
        },
        onError: () => {
          toast({ title: "Failed to update profile", variant: "destructive" });
        }
      }
    );
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Pilot Profile</h1>
        <p className="text-muted-foreground">Manage your personal aviation identity.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-6">
          <Avatar className="w-20 h-20 border-2 border-primary">
            <AvatarFallback className="text-2xl bg-secondary text-secondary-foreground font-bold">
              {profile?.avatarInitials || profile?.name?.substring(0, 2).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{profile?.name || "Pilot"}</CardTitle>
            <CardDescription>{profile?.homeAirport ? `Based at ${profile.homeAirport}` : "No home base set"}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Chuck Yeager" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="homeAirport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Airport (IATA)</FormLabel>
                      <FormControl>
                        <Input placeholder="LHR" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="avatarInitials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar Initials</FormLabel>
                      <FormControl>
                        <Input placeholder="CY" maxLength={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Aviation enthusiast since 1995..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
