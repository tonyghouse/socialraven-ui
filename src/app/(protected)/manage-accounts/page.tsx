'use client';

import { useState } from 'react';
import { X, Plus, Instagram, Twitter, Linkedin, Facebook, Youtube, Check, Link2, Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ConnectedAccount {
  id: string;
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook' | 'youtube';
  username: string;
  followers: number;
  connectedAt: string;
}

interface AvailablePlatform {
  id: string;
  name: string;
  icon: typeof Instagram;
  color: string;
  bgColor: string;
  path:string;
}

export default function ManageAccountsPage() {
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([
    {
      id: '1',
      platform: 'instagram',
      username: '@creativebrand',
      followers: 12500,
      connectedAt: '2024-01-15',
    },
    {
      id: '2',
      platform: 'twitter',
      username: '@brandvoice',
      followers: 8300,
      connectedAt: '2024-02-10',
    },
    {
      id: '3',
      platform: 'instagram',
      username: '@brandstudio',
      followers: 5200,
      connectedAt: '2024-03-05',
    },
  ]);

  const availablePlatforms: AvailablePlatform[] = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500', bgColor: 'bg-pink-50 hover:bg-pink-100', path:'/api/auth/linkedin' },
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'text-black', bgColor: 'bg-gray-50 hover:bg-gray-100', path: '' },
    // { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100', path: '' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-500', bgColor: 'bg-blue-50 hover:bg-blue-100', path: '' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600', bgColor: 'bg-red-50 hover:bg-red-100', path: '' },
  ];

  const disconnectAccount = (id: string) => {
    setConnectedAccounts(connectedAccounts.filter(account => account.id !== id));
  };

  const handleLinkAccount = (platform: AvailablePlatform) => {

    console.log(`Linking ${platform} account...`);


  };

  const getPlatformIcon = (platform: string) => {
    const platformMap: Record<string, typeof Instagram> = {
      instagram: Instagram,
      twitter: Twitter,
      linkedin: Linkedin,
      facebook: Facebook,
      youtube: Youtube,
    };
    return platformMap[platform] || Instagram;
  };

  const getPlatformColor = (platform: string): string => {
    const colorMap: Record<string, string> = {
      instagram: 'text-pink-500',
      twitter: 'text-black',
      linkedin: 'text-blue-600',
      facebook: 'text-blue-500',
      youtube: 'text-red-600',
    };
    return colorMap[platform] || 'text-gray-500';
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Manage Accounts</h1>
          <p className="text-muted-foreground">Connect and manage your social media accounts</p>
        </div>

        {/* Connected Accounts Section */}
        {connectedAccounts.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Check className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-semibold text-foreground">Connected Accounts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {connectedAccounts.map((account) => {
                const PlatformIcon = getPlatformIcon(account.platform);
                const iconColor = getPlatformColor(account.platform);
                return (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-50 to-purple-50 group-hover:from-cyan-100 group-hover:to-purple-100 transition-colors">
                        <PlatformIcon className={`h-5 w-5 ${iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground capitalize">{account.platform}</p>
                        <p className="text-sm text-muted-foreground">{account.username}</p>
                        <p className="text-xs text-muted-foreground">{account.followers.toLocaleString()} followers</p>
                      </div>
                    </div>
                    <button
                      onClick={() => disconnectAccount(account.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Disconnect account"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Platforms Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Link New Account</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">


                {/* Linkedin */}
                <Link href="/api/auth/linkedin">
                
                <button
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 transition-all duration-200 text-blue-600 hover:shadow-md hover:border-primary/30 cursor-pointer`}
                >
                  <div className="p-3 rounded-lg bg-white">
                    <Linkedin className={`h-6 w-6 text-blue-600`} />
                  </div>
                  <span className="text-sm font-medium text-center text-foreground">Linkedin</span>
                  {1 > 0 && (
                    <span className="text-xs text-primary font-medium">{1} connected</span>
                  )}
                </button>
                </Link>
           
           
            {/* {availablePlatforms.map((platform) => {
              const Icon = platform.icon;
              const connectedCount = connectedAccounts.filter(acc => acc.platform === platform.id).length;
              return (
                <button
                  key={platform.id}
                  onClick={() => handleLinkAccount(platform)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 transition-all duration-200 ${platform.bgColor} hover:shadow-md hover:border-primary/30 cursor-pointer`}
                >
                  <div className="p-3 rounded-lg bg-white">
                    <Icon className={`h-6 w-6 ${platform.color}`} />
                  </div>
                  <span className="text-sm font-medium text-center text-foreground">{platform.name}</span>
                  {connectedCount > 0 && (
                    <span className="text-xs text-cyan-600 font-medium">{connectedCount} connected</span>
                  )}
                </button>
              );
            })} */}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-purple-50 rounded-lg border border-cyan-200/50">
          <p className="text-sm text-foreground">
             Connect multiple accounts to schedule posts across all platforms at once. Your accounts are securely encrypted and stored.
          </p>
        </div>
      </div>
    </div>
  );
}
