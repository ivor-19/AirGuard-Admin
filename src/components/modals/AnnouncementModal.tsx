import React, { useEffect, useState } from 'react';
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from 'axios';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';

interface Reading {
  aqi: number;
  pm2_5: number;
  pm10: number;
  co: number;
  no2: number;
}

const getAirQualityStatus = (aqi: number) => {
  if (aqi <= 10) return {
    message: "Alert: Air quality is optimal, no health concerns. Outdoor activities can continue as usual.",
    subject: "Air Quality: Optimal",
    risk: 'Minimal Risk',
    condition: 'Conditions are stable and low-risk, requiring minimal attention.'
  };
  if (aqi <= 40) return {
    message: "Advisory: Air quality is acceptable. Minor precautions may be needed for sensitive individuals.",
    subject: "Air Quality: Acceptable",
    risk: 'Mild Risk',
    condition: 'Mild'
  };
  if (aqi <= 90) return {
    message: "Warning: Air quality is moderate. Sensitive individuals may experience mild symptoms",
    subject: "Air Quality: Moderate",
    risk: 'Moderate Risk',
    condition: 'Raised'
  };
  if (aqi <= 200) return {
    message: "Warning: Air quality is dangerous. People with respiratory or heart conditions should go far from areas with poor air quality to reduce exposure.",
    subject: "Air Quality: High - Health Alert",
    risk: 'Unhealthy for Sensitive Groups',
    condition: 'Serious'
  };
  if (aqi <= 280) return {
    message: "Advisory: Air quality is very dangerous. Everyone should avoid outdoor activities and move far from areas with poor air quality. Vulnerable individuals should prioritize safety and avoid exposure.",
    subject: "Air Quality: Very High - Urgent",
    risk: 'Very High Risk',
    condition: 'Severe'
  };
  return {
    message: "Emergency: Air quality is critically hazardous. It is strongly advised that everyone go far from affected areas and take necessary precautions.",
    subject: "Air Quality: Emergency - Critical",
    risk: 'Extremely High',
    condition: 'Hazardous'
  };
};

const formatTime = () => {
  const time = new Date();
  return time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

const formatDate = () => new Date().toISOString().split('T')[0];

const chatFormatDate = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const chatFormatTime = () => {
  const time = new Date();
  return time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).toLowerCase(); // to get "pm" instead of "PM"
};

export const AnnouncementModal = () => {
  const { userCred } = useAuth();
  const [toEmail, setToEmail] = useState('');
  const [airQuality, setAirQuality] = useState('');
  const [messageAlert, setMessageAlert] = useState('');
  const [sendAQ, setSendAQ] = useState<Reading>();
  const [subject, setSubject] = useState('Air Quality Alert');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const { data } = await axios.get('https://air-quality-back-end-v2.vercel.app/users/emails');
        const emails = data.emails
          .filter((item: { email?: string }) => item.email?.trim())
          .map((item: { email?: string }) => item.email || '');
        setToEmail(emails.join(','));
      } catch (error) {
        console.error(error);
      }
    };
    fetchEmails();
  }, []);

  const fetchAirQuality = async () => {
    try {
      const { data } = await axios.get('https://air-quality-back-end-v2.vercel.app/aqReadings');
      const aq = data.aqReadings[0];
      setSendAQ(aq);
      
      const { message, subject, risk, condition } = getAirQualityStatus(aq.aqi);
      setMessageAlert(message);
      setSubject(subject);
      
      setAirQuality(`AQI: ${aq.aqi}\nPM 2.5: ${aq.pm2_5}\nPM 10: ${aq.pm10}\nCO: ${aq.co}\nNO2: ${aq.no2}\nTimestamp: ${formatTime()}\nDate: ${formatDate()}\nRisk: ${risk}\nCondition: ${condition}`);
    } catch (error) {
      console.error(error);
      setAirQuality("Failed to load air quality data");
    }
  };

  const sendAlert = async () => {
    setLoading(true);
    try {
      await axios.post('https://air-quality-back-end-v2.vercel.app/email/send', {
        to: toEmail,
        subject,
        message: `${messageAlert}\n${airQuality}`
      });

      await axios.post('https://air-quality-back-end-v2.vercel.app/history', {
        date: formatDate(),
        timestamp: formatTime(),
        aqi: sendAQ?.aqi,
        pm2_5: sendAQ?.pm2_5,
        pm10: sendAQ?.pm10,
        co: sendAQ?.co,
        no2: sendAQ?.no2,
        scanned_by: userCred?.username,
        scanned_using_model: "modelx21",
        message: messageAlert,
      });

      const newChatAlert = {
        message: `${messageAlert}\n${airQuality}`,
        sender: userCred?.username,
        role: userCred?.role,
        timestamp: chatFormatTime(),
        date: chatFormatDate(),
      }

      await axios.post('https://air-quality-back-end-v2.vercel.app/chat', newChatAlert)
      console.log('Chat is send: ', newChatAlert);

      const response = await axios.get('https://air-quality-back-end-v2.vercel.app/users/notifications/getNotifs');
      const tokens = response.data.allDeviceNotifs

      await axios.post("https://air-quality-back-end-v2.vercel.app/expoToken/sendNotification", {
        to: tokens,
        title: "Air Guard Chat",
        body: `Admin: ${messageAlert}\n${airQuality}`,
        sound: "default"
      })

      setIsOpen(false);
      toast.success("Sent successfully");
    } catch (error) {
      console.error('Error sending email', error);
      toast.error('Unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) fetchAirQuality();
    }}>
      <DialogTrigger asChild>
        <Button variant="secondary"><Send className="mr-2 h-4 w-4"/>Send Announcement</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md font-geist">
        <DialogHeader>
          <DialogTitle>You are about to send a message</DialogTitle>
          <DialogDescription>This message will be sent to everyone with an email address.</DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center border px-2 rounded-md border-zinc-700 gap-2">
          <span className='text-sm'>To: </span>
          <Input className="border-none outline-none" value={toEmail} disabled />
        </div>
        
        <div className="flex items-center border px-2 rounded-md border-zinc-700 gap-2">
          <span className='text-sm'>Subject: </span>
          <Input 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}  
            className="focus-visible:ring-0 focus-visible:ring-offset-0 border-none"
          />
        </div>
        
        <div className="border px-2 rounded-md border-zinc-700">
          <Textarea 
            value={messageAlert} 
            onChange={(e) => setMessageAlert(e.target.value)} 
            className="h-24 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 border-none"
          />
          <Textarea 
            className='h-60 focus-visible:ring-0 focus-visible:ring-offset-0 border-none' 
            value={airQuality}
            disabled
          />
        </div>
        
        <DialogFooter>
          <Button onClick={sendAlert} disabled={loading}>
            {loading ? <Loader2 className='animate-spin' /> : <><Send className="mr-2 h-4 w-4"/>Send</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};