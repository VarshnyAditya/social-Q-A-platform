import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/AuthContext";
import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

export default function SignUpPage() {
  const router = useRouter();
  const { Signup, loading } = useAuth();
  const [form, setform] = useState({ name: "", email: "", password: "", phone: "" });

  const handleChange = (e: any) => {
    setform({ ...form, [e.target.id]: e.target.value });
  };

  const handlesubmit = async (e: any) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email and password are required");
      return;
    }
    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }
    try {
      await Signup(form);
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 lg:mb-8">
          <Link href="/" className="flex items-center justify-center mb-4">
            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-orange-500 rounded mr-2 flex items-center justify-center">
              <div className="w-4 h-4 lg:w-6 lg:h-6 bg-white rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-orange-500 rounded-sm"></div>
              </div>
            </div>
            <span className="text-lg lg:text-xl font-bold text-gray-800">
              Code<span className="font-normal">Quest</span>
            </span>
          </Link>
        </div>
        <form onSubmit={handlesubmit}>
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-xl lg:text-2xl">Create your account</CardTitle>
              <CardDescription>Join the CodeQuest community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Display name</Label>
                <Input id="name" placeholder="Enter your display name" value={form.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" value={form.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">
                  Phone Number <span className="text-gray-400 font-normal">(optional — used for password recovery)</span>
                </Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    +91
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit number"
                    value={form.phone}
                    onChange={handleChange}
                    className="rounded-l-none"
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-gray-400">Adding your phone number lets you recover your account using it.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <Input id="password" type="password" value={form.password} onChange={handleChange} />
                <p className="text-xs text-gray-600">Passwords must contain at least eight characters, including at least 1 letter and 1 number.</p>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="terms" className="mt-1" />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  I agree to the{" "}
                  <Link href="#" className="text-blue-600 hover:underline">Terms of Service</Link>{" "}
                  and{" "}
                  <Link href="#" className="text-blue-600 hover:underline">Privacy Policy</Link>
                </Label>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                {loading ? "Signing up..." : "Sign up"}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth" className="text-blue-600 hover:underline">Log in</Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
