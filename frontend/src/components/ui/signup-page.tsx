"use client"

import { useState } from "react";
import { Mail, User, Briefcase, Building, ShieldCheck } from "lucide-react";
import { 
  Card, 
  FormHeader, 
  InputField, 
  PasswordField, 
  Button, 
  Divider, 
  SocialButton, 
  FormFooter, 
  GradientBackground, 
  HeroSection 
} from "./signin-page";

const SignUp = ({ onNavigate }: { onNavigate?: (view: string) => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          full_name: fullName,
          role: role,
          organization_name: organizationName,
          email: email, 
          password: password 
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("token", data.data.access_token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        if (onNavigate) {
          onNavigate("dashboard");
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    console.log("Google sign up clicked");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full">
      {/* Left Side - Hero Section with Gradient Background */}
      <GradientBackground variant="lilac">
        <HeroSection
          title="Join Klyro"
          description="Create your brand's AI-powered intelligence hub. Maintain identity, analyze assets, and grow with confidence."
          icon={
            <img src="/logo.jpeg" alt="Klyro Logo" className="w-12 h-12 rounded-xl object-cover" />
          }
          showProgress={false}
        />
      </GradientBackground>

      {/* Right Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          <FormHeader 
            title="Create an account"
            subtitle="Enter your details to get started"
          />

          <Card className="p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
              
              <InputField
                id="fullName"
                type="text"
                label="Full Name"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={User}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  id="role"
                  type="text"
                  label="Role"
                  placeholder="e.g. Brand Manager"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  icon={Briefcase}
                  required
                />

                <InputField
                  id="organizationName"
                  type="text"
                  label="Brand Name"
                  placeholder="Acme Corp"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  icon={Building}
                  required
                />
              </div>

              <InputField
                id="email"
                type="email"
                label="Official Email"
                placeholder="name@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
              />

              <PasswordField
                id="password"
                label="Password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                required
              />

              <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              <Divider text="Or continue with" />

              <SocialButton provider="google" onClick={handleGoogleSignUp}>
                Sign up with Google
              </SocialButton>
            </form>

            <FormFooter 
              text="Already have an account?"
              linkText="Sign in"
              onLinkClick={() => onNavigate && onNavigate("login")}
              linkHref="/login"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
