"use client";
import React, { useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Star,
  Shield,
  Clock,
  TrendingUp,
  Users,
  Gift,
  ChevronRight,
  CheckCircle,
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  RefreshCw,
  Plus,
  Minus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { toast } from "react-toastify";

const WebshopDetailClient = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isFavorited, setIsFavorited] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("blue");

  // Mock data for demonstration
  const webshopData = {
    id: "1",
    name: "TechStore Pro",
    logo: "https://avatar.iran.liara.run/public/45",
    cashback: "10%",
    description:
      "Premium technology store with the latest gadgets and electronics",
    category: "Electronics",
    rating: 4.8,
    featured: true,
    images: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop",
    ],
    price: 299.99,
    originalPrice: 399.99,
    discount: 25,
    inStock: true,
    stockCount: 42,
    reviews: 1247,
    specifications: {
      brand: "TechStore",
      model: "Pro Max",
      color: ["Black", "White", "Blue", "Red"],
      size: ["S", "M", "L", "XL"],
      material: "Premium Materials",
      weight: "1.2kg",
      dimensions: "30x20x10cm",
      warranty: "2 Years",
      origin: "USA",
      certifications: ["CE", "FCC", "RoHS"],
    },
    features: [
      "Premium Quality Materials",
      "Advanced Technology",
      "2-Year Warranty",
      "Free Shipping",
      "30-Day Return Policy",
      "24/7 Customer Support",
    ],
    benefits: [
      "Save up to 25% with our cashback program",
      "Free shipping on orders over $50",
      "Exclusive member discounts",
      "Priority customer support",
      "Early access to new products",
    ],
    shipping: {
      free: true,
      standard: "3-5 business days",
      express: "1-2 business days",
      international: "7-14 business days",
    },
    returns: {
      policy: "30-day return policy",
      condition: "Items must be in original condition",
      process: "Easy online return process",
    },
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleFavoriteClick = () => {
    setIsFavorited(!isFavorited);
  };

  const handleShareClick = () => {
    setIsShared(!isShared);
  };

  const handleQuantityChange = (value: number) => {
    setQuantity(Math.max(1, value));
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handleAddToCart = () => {
    console.log("Added to cart:", {
      quantity,
      size: selectedSize,
      color: selectedColor,
    });
    toast.success("Added to cart!");
  };

  const handleBuyNow = async () => {
    console.log("🛒 BUY NOW CLICKED!");
    console.log("Buy now:", {
      quantity,
      size: selectedSize,
      color: selectedColor,
    });

    // Calculate total price
    const totalPrice = webshopData.price * quantity;
    const cashbackAmount = Math.round(totalPrice * 0.1 * 100) / 100;

    console.log(
      `💰 Price calculation: €${totalPrice} × 10% = €${cashbackAmount}`,
    );

    // Get user data
    const userDataStr = localStorage.getItem("user_data");
    if (!userDataStr) {
      toast.error("Please login to earn cashback!");
      console.error("❌ No user data found in localStorage");
      return;
    }

    const userData = JSON.parse(userDataStr);
    console.log("👤 User data:", { id: userData.id, name: userData.name });

    // Simulate purchase and track cashback
    try {
      const orderId = "WEBSHOP_" + Date.now();

      console.log("📤 Sending purchase tracking request...");
      console.log("Order details:", {
        orderId,
        userId: userData.id,
        totalPrice,
        cashbackAmount,
        shop: webshopData.name,
      });

      // Track purchase
      const response = await fetch("/api/v1/widget/track-purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.id.toString(),
          order_value: totalPrice,
          order_id: orderId,
          shop_name: webshopData.name,
          public_key: "webshop-key",
          timestamp: new Date().toISOString(),
          product_name: `${webshopData.name} - ${selectedColor} - ${selectedSize}`,
          product_id: webshopData.id,
        }),
      });

      console.log(`📥 API Response Status: ${response.status}`);

      const result = await response.json();
      console.log("📥 Full API Response:", result);

      if (result.success) {
        console.log(
          "✅ SUCCESS! Cashback tracked and wallet should be credited",
        );
        console.log("Response data:", result.data);

        toast.success(
          `🎉 Purchase confirmed! You earned €${cashbackAmount} cashback!`,
          {
            autoClose: 5000,
          },
        );

        // Show additional success message
        setTimeout(() => {
          toast.info(`💰 €${cashbackAmount} has been added to your wallet!`);
        }, 2000);

        console.log("✅ Cashback tracked:", result);
      } else {
        console.error("❌ API returned failure:", result);
        toast.error(
          `Purchase tracking failed: ${result.error || "Unknown error"}`,
        );
      }
    } catch (error) {
      console.error("❌ CRITICAL: Purchase tracking error:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : "No stack",
      });
      toast.error(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-3">
                <img
                  src={webshopData.logo}
                  alt={webshopData.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {webshopData.name}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {webshopData.category}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteClick}
                className={isFavorited ? "text-red-500" : ""}
              >
                <Heart
                  className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShareClick}
                className={isShared ? "text-blue-500" : ""}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-xl border overflow-hidden">
              <img
                src={webshopData.images[0]}
                alt={webshopData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {webshopData.images.slice(1).map((image, index) => (
                <div
                  key={index}
                  className="aspect-square bg-white rounded-lg border overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <img
                    src={image}
                    alt={`${webshopData.name} ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  {webshopData.cashback} Cashback
                </Badge>
                <Badge
                  variant="outline"
                  className="flex items-center space-x-1"
                >
                  <Star className="w-3 h-3 fill-current text-yellow-400" />
                  <span>{webshopData.rating}</span>
                  <span className="text-gray-500">({webshopData.reviews})</span>
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {webshopData.name}
              </h1>
              <p className="text-gray-600 mb-4">{webshopData.description}</p>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ${webshopData.price}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    ${webshopData.originalPrice}
                  </span>
                </div>
                <Badge
                  variant="destructive"
                  className="bg-red-100 text-red-800"
                >
                  {webshopData.discount}% OFF
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>In Stock ({webshopData.stockCount} available)</span>
                </div>
              </div>
            </div>

            {/* Product Options */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Size
                </Label>
                <div className="flex space-x-2">
                  {webshopData.specifications.size.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSizeChange(size)}
                      className="min-w-[40px]"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Color
                </Label>
                <div className="flex space-x-2">
                  {webshopData.specifications.color.map((color) => (
                    <Button
                      key={color}
                      variant={selectedColor === color ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleColorChange(color)}
                      className="min-w-[60px]"
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Quantity
                </Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-2 border rounded-md min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                variant="outline"
                className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Buy Now
              </Button>
            </div>

            {/* Features */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
              <div className="space-y-2">
                {webshopData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 mb-4">
                      {webshopData.description}
                    </p>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Benefits
                    </h3>
                    <ul className="space-y-2">
                      {webshopData.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Gift className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(webshopData.specifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between py-2 border-b border-gray-200"
                        >
                          <span className="font-medium text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}:
                          </span>
                          <span className="text-gray-900">
                            {Array.isArray(value) ? value.join(", ") : value}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span>Customer Reviews</span>
                    <Badge variant="secondary">({webshopData.reviews})</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {webshopData.rating}
                        </div>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.floor(webshopData.rating)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <div
                              key={rating}
                              className="flex items-center space-x-2"
                            >
                              <span className="text-sm text-gray-600 w-8">
                                {rating}★
                              </span>
                              <Progress
                                value={Math.random() * 100}
                                className="flex-1 h-2"
                              />
                              <span className="text-sm text-gray-600 w-8">
                                {Math.floor(Math.random() * 200)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Truck className="w-5 h-5" />
                      <span>Shipping Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Standard Shipping:
                        </span>
                        <span className="font-medium">
                          {webshopData.shipping.standard}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Express Shipping:</span>
                        <span className="font-medium">
                          {webshopData.shipping.express}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">International:</span>
                        <span className="font-medium">
                          {webshopData.shipping.international}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Free Shipping:</span>
                        <span className="font-medium text-green-600">
                          {webshopData.shipping.free ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <RefreshCw className="w-5 h-5" />
                      <span>Returns & Exchanges</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Return Policy:</span>
                        <span className="font-medium">
                          {webshopData.returns.policy}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Condition:</span>
                        <span className="font-medium">
                          {webshopData.returns.condition}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Process:</span>
                        <span className="font-medium">
                          {webshopData.returns.process}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="#" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="#" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="#" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="#" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Cookies
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    License
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">CashFlow</span>
            </div>
            <p className="text-sm">
              &copy; 2025 CashFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebshopDetailClient;
