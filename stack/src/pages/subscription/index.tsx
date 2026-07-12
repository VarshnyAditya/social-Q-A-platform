import { useEffect, useState } from "react";
import Head from "next/head";
import Script from "next/script";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { toast } from "react-toastify";

const PLAN_ORDER = ["free", "bronze", "silver", "gold"];

const PLAN_COPY: Record<string, { color: string; tagline: string }> = {
  free: { color: "border-gray-300", tagline: "Get started" },
  bronze: { color: "border-orange-400", tagline: "For casual askers" },
  silver: { color: "border-gray-400", tagline: "For active users" },
  gold: { color: "border-yellow-500", tagline: "Unlimited questions" },
};

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [plans, setPlans] = useState<any>(null);
  const [myStatus, setMyStatus] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const plansRes = await axiosInstance.get("/subscription/plans");
        setPlans(plansRes.data.plans);
        if (user) {
          const statusRes = await axiosInstance.get("/subscription/mystatus");
          setMyStatus(statusRes.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [user]);

  const handleSubscribe = async (planKey: string) => {
    if (!user) {
      toast.error("Please log in first");
      return;
    }
    if (planKey === "free") return;

    setLoadingPlan(planKey);
    try {
      const { data } = await axiosInstance.post("/subscription/create-order", {
        plan: planKey,
      });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "StackClone",
        description: `${planKey.toUpperCase()} Plan Subscription`,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            await axiosInstance.post("/subscription/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planKey,
            });
            toast.success("Payment successful! Invoice has been emailed to you.");
            const statusRes = await axiosInstance.get("/subscription/mystatus");
            setMyStatus(statusRes.data);
          } catch (err: any) {
            toast.error(err.response?.data?.message || "Payment verification failed");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#ef8236" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function () {
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Could not start payment. Try again between 10–11 AM IST."
      );
    } finally {
      setLoadingPlan(null);
    }
  };

  if (!plans) {
    return (
      <Mainlayout>
        <div className="p-6">Loading plans...</div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <Head>
        <title>Subscription Plans</title>
      </Head>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="p-4 lg:p-6">
        <h1 className="text-xl lg:text-2xl font-semibold mb-2">{t("pages.subscriptionPlans")}</h1>
        <p className="text-sm text-gray-600 mb-2">
          {t("pages.subscriptionSubtitle")}
        </p>
        <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 inline-block px-3 py-1.5 rounded mb-6">
          ⏰ Payments are accepted only between <strong>10:00 AM – 11:00 AM IST</strong>
        </p>

        {myStatus && (
          <div className="mb-6 text-sm bg-blue-50 border border-blue-200 px-4 py-3 rounded">
            Current plan: <strong className="capitalize">{myStatus.plan}</strong> (
            {myStatus.dailyLimit === undefined
              ? ""
              : myStatus.dailyLimit === "Infinity"
              ? "Unlimited questions/day"
              : `${myStatus.dailyLimit} question(s)/day`}
            )
            {myStatus.expiryDate && (
              <> — expires {new Date(myStatus.expiryDate).toLocaleDateString()}</>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLAN_ORDER.map((key) => {
            const plan = plans[key];
            const isCurrent = myStatus?.plan === key;
            return (
              <div
                key={key}
                className={`border-2 ${PLAN_COPY[key].color} rounded-lg p-5 flex flex-col bg-white shadow-sm`}
              >
                <h2 className="text-lg font-semibold capitalize">{plan.label}</h2>
                <p className="text-xs text-gray-500 mb-3">{PLAN_COPY[key].tagline}</p>
                <div className="text-2xl font-bold mb-1">
                  {plan.price === 0 ? "₹0" : `₹${plan.price / 100}`}
                  <span className="text-sm font-normal text-gray-500">
                    {plan.price === 0 ? "" : " / month"}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  {plan.dailyLimit === null || plan.dailyLimit === undefined
                    ? ""
                    : plan.dailyLimit === "Infinity"
                    ? "Unlimited questions/day"
                    : `${plan.dailyLimit} question(s)/day`}
                </p>
                <button
                  disabled={key === "free" || isCurrent || loadingPlan === key}
                  onClick={() => handleSubscribe(key)}
                  className={`mt-auto w-full py-2 rounded text-sm font-medium transition ${
                    isCurrent
                      ? "bg-green-100 text-green-700 cursor-default"
                      : key === "free"
                      ? "bg-gray-100 text-gray-500 cursor-default"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isCurrent
                    ? "Current Plan"
                    : key === "free"
                    ? "Default Plan"
                    : loadingPlan === key
                    ? "Processing..."
                    : "Subscribe"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </Mainlayout>
  );
}