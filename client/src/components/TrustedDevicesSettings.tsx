import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Laptop, Smartphone, Trash2, MapPin, Calendar, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface TrustedDevice {
  deviceId: string;
  deviceName: string;
  ipAddress: string;
  location: {
    country: string;
    city: string;
  };
  lastUsed: string;
  createdAt: string;
  expiresAt: string;
}

export function TrustedDevicesSettings() {
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingDevice, setRemovingDevice] = useState<string | null>(null);
  const [showRemoveAllDialog, setShowRemoveAllDialog] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await api.get('/auth/trusted-devices');
      setDevices(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load trusted devices');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      setRemovingDevice(deviceId);
      await api.delete(`/auth/trusted-devices/${deviceId}`);
      toast.success('Device removed successfully');
      fetchDevices();
    } catch (error) {
      toast.error('Failed to remove device');
    } finally {
      setRemovingDevice(null);
    }
  };

  const handleRemoveAll = async () => {
    try {
      await api.delete('/auth/trusted-devices');
      toast.success('All trusted devices removed');
      setShowRemoveAllDialog(false);
      fetchDevices();
    } catch (error) {
      toast.error('Failed to remove devices');
    }
  };

  const getDeviceIcon = (deviceName: string) => {
    const lower = deviceName.toLowerCase();
    if (lower.includes('android') || lower.includes('ios') || lower.includes('iphone') || lower.includes('ipad')) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Laptop className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trusted Devices</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Trusted Devices
              </CardTitle>
              <CardDescription>
                Devices that don't require 2FA verification (trusted for 30 days)
              </CardDescription>
            </div>
            {devices.length > 1 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowRemoveAllDialog(true)}
                className="text-destructive hover:text-destructive"
              >
                Remove All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-20" />
              <p className="text-sm text-muted-foreground">No trusted devices</p>
              <p className="text-xs text-muted-foreground mt-1">
                After successful 2FA verification, devices will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => (
                <div
                  key={device.deviceId}
                  className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex gap-3">
                    <div className="mt-1 text-primary">
                      {getDeviceIcon(device.deviceName)}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium text-sm">{device.deviceName}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {device.location.city}, {device.location.country}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Last used: {format(new Date(device.lastUsed), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs mt-2">
                        Expires: {format(new Date(device.expiresAt), 'MMM d, yyyy')}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDevice(device.deviceId)}
                    disabled={removingDevice === device.deviceId}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {removingDevice === device.deviceId ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove All Dialog */}
      <AlertDialog open={showRemoveAllDialog} onOpenChange={setShowRemoveAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remove All Trusted Devices?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all trusted devices. You'll need to complete 2FA verification on every device next time you log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove All Devices
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}