import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Mail, Zap, EyeOff, RotateCcw, Play } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Footer } from "@/components/Footer";
import AccountModal from "../components/AccountModal";

interface TempAccount {
  id: string;
  username: string;
  password: string;
  emailAddress: string;
  createdAt: string;
}

export default function Home() {
  const [, navigate] = useLocation();
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { toast } = useToast();
  const { t } = useLanguage();

  const testimonials = [
    {
      text: t('home.testimonials.john'),
      name: "John Davis",
      role: "Software Developer",
      image: "https://i.imgur.com/mBkFG6F.jpeg"
    },
    {
      text: t('home.testimonials.sarah'),
      name: "Sarah Chen",
      role: "Digital Marketing Consultant", 
      image: "https://i.imgur.com/LNxXPXs.jpeg"
    },
    {
      text: t('home.testimonials.michael'),
      name: "Michael Rodriguez",
      role: "Product Manager",
      image: "https://i.imgur.com/apk7Gae.jpeg"
    }
  ];

  // Check for existing account on page load
  useEffect(() => {
    const existingAccountId = localStorage.getItem('nordmail_account_id');
    if (existingAccountId) {
      // Verify account still exists
      fetch(`/api/account/${existingAccountId}`)
        .then(res => {
          if (res.ok) {
            navigate(`/dashboard/${existingAccountId}`);
          } else {
            // Account no longer exists, clear storage
            localStorage.removeItem('nordmail_account_id');
          }
        })
        .catch(() => {
          // Network error, clear storage
          localStorage.removeItem('nordmail_account_id');
        });
    }
  }, [navigate]);

  // Rotate testimonials every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const createAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/account/create");
      return response.json();
    },
    onSuccess: (data: { account: TempAccount; email: { id: string; emailAddress: string } }) => {
      // Store account ID in localStorage for future visits
      localStorage.setItem('nordmail_account_id', data.account.id);
      
      toast({
        title: t('dashboard.created'),
        description: t('dashboard.emailReady'),
      });
      navigate(`/dashboard/${data.account.id}`);
    },
    onError: (error) => {
      toast({
        title: t('dashboard.error'),
        description: t('dashboard.createError'),
        variant: "destructive",
      });
    },
  });

  const handleStartService = () => {
    createAccountMutation.mutate();
  };

  return (
    <>
      {/* Header */}
      <header className="border-b border-gray-800 sticky top-0 bg-black/80 backdrop-blur-sm z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-nord-green rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-bold nord-green">NordMail</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAccountModal(true)}
              className="p-2 hover:bg-nord-dark"
            >
              <div className="w-6 h-6 bg-nord-green rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-black rounded-full" />
              </div>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          {/* Moving Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-nord-green/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-bounce" style={{animationDuration: '6s'}}></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-nord-green/10 rounded-full blur-2xl animate-bounce" style={{animationDuration: '8s', animationDelay: '1s'}}></div>
          </div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(179,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(179,255,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" style={{animationDuration: '4s'}}></div>
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <span className="bg-nord-green/10 text-nord-green px-4 py-2 rounded-full text-sm font-medium border border-nord-green/20 mb-6 inline-block">
              🔥 Trusted by 100,000+ users worldwide
            </span>
            <div className="w-20 h-20 bg-nord-green rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-nord-green/20">
              <Mail className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              {t('home.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
              <Button
                onClick={handleStartService}
                disabled={createAccountMutation.isPending}
                size="lg"
                className="bg-nord-green text-black hover:bg-nord-green/90 font-bold px-12 py-4 text-xl shadow-2xl shadow-nord-green/20 hover:shadow-nord-green/30 transition-all transform hover:scale-105"
              >
                {createAccountMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mr-3" />
                    Creating Your Email...
                  </>
                ) : (
                  <>
                    <Shield className="w-6 h-6 mr-3" />
                    {t('home.createEmail')}
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAccountModal(true)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 font-semibold px-8 py-4 text-lg"
              >
                {t('home.accessAccount')}
              </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400 mb-12">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>✓ {t('home.noRegistration')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>✓ {t('home.instantActivation')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>✓ Enterprise-Grade Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>✓ {t('home.realTimeDelivery')}</span>
            </div>
          </div>

          <Card className="bg-black/30 border-gray-800/50 p-8 mb-12 max-w-4xl mx-auto backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-nord-green/20 rounded-xl flex items-center justify-center mb-4 shadow-lg border border-nord-green/30">
                  <Zap className="w-8 h-8 nord-green" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t('home.features.fast.title')}</h3>
                <p className="text-gray-400">{t('home.features.fast.description')}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-nord-green/20 rounded-xl flex items-center justify-center mb-4 shadow-lg border border-nord-green/30">
                  <EyeOff className="w-8 h-8 nord-green" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t('home.features.privacy.title')}</h3>
                <p className="text-gray-400">{t('home.features.privacy.description')}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-nord-green/20 rounded-xl flex items-center justify-center mb-4 shadow-lg border border-nord-green/30">
                  <RotateCcw className="w-8 h-8 nord-green" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t('home.features.real.title')}</h3>
                <p className="text-gray-400">{t('home.features.real.description')}</p>
              </div>
            </div>
          </Card>

          
          <div className="bg-black/30 border border-gray-800/50 rounded-2xl p-6 backdrop-blur-sm max-w-2xl mx-auto min-h-[140px] flex flex-col justify-between">
            <p className="text-gray-300 text-lg mb-4 leading-relaxed">
              "{testimonials[currentTestimonial].text}"
            </p>
            <div className="flex items-center justify-center space-x-3">
              <img 
                src={testimonials[currentTestimonial].image}
                alt={testimonials[currentTestimonial].name}
                className="w-10 h-10 rounded-full shadow-lg object-cover"
              />
              <div className="text-left">
                <p className="font-semibold">{testimonials[currentTestimonial].name}</p>
                <p className="text-sm text-gray-400">{testimonials[currentTestimonial].role}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <AccountModal 
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
      />
    </>
  );
}
