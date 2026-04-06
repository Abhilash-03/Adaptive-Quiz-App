import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  TrendingUp,
  Zap,
  Target,
  Award,
  Star,
  Brain,
  Users,
} from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import AuthModal from "@/components/shared/AuthModal";
import LandingHeader from "./LandingHeader";
import LandingFooter from "./LandingFooter";
import {
  features,
  whyQuizAI,
  stats,
  studentServices,
  teacherServices,
  aboutChecklist,
} from "./landing.constants";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");

  const openAuthModal = (tab) => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  // If already authenticated, redirect to dashboard
  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (user?.role === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } else {
      openAuthModal("register");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader onSignIn={() => openAuthModal("login")} onSignUp={() => openAuthModal("register")} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">AI-Powered Adaptive Learning</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Master Any Subject with{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-violet-400">
                Intelligent Quizzes
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Experience personalized learning that adapts to your skill level. QuizAI makes studying
              smarter, faster, and more engaging than ever before.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto text-base px-8" onClick={handleGetStarted}>
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base px-8"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                Learn More
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-1 mt-8">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-linear-to-br from-primary/60 to-violet-500/60 border-2 border-background flex items-center justify-center text-xs font-medium"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="ml-3 text-left">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Loved by 10,000+ learners</p>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="mt-16 relative">
            <div className="max-w-4xl mx-auto rounded-xl overflow-hidden bg-linear-to-br from-card to-card/50 border border-border/50 shadow-2xl shadow-primary/5">
              <div className="absolute inset-0 bg-grid-white/5" />
              <div className="relative flex items-center justify-center p-6 md:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 w-full max-w-3xl">
                  {/* Quiz Card Preview */}
                  <div className="bg-card/80 backdrop-blur rounded-lg p-4 border border-border/50 shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <GraduationCap className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Math Quiz</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-muted rounded-full w-full" />
                      <div className="h-2 bg-muted rounded-full w-3/4" />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>10 Questions</span>
                      <span className="text-primary">Easy</span>
                    </div>
                  </div>

                  {/* Analytics Preview */}
                  <div className="bg-card/80 backdrop-blur rounded-lg p-4 border border-border/50 shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <span className="text-sm font-medium">Progress</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Accuracy</span>
                          <span className="text-green-500">85%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-[85%] bg-green-500 rounded-full" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Completion</span>
                          <span className="text-primary">92%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-[92%] bg-primary rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Achievement Preview */}
                  <div className="bg-card/80 backdrop-blur rounded-lg p-4 border border-border/50 shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                        <Award className="h-4 w-4 text-yellow-500" />
                      </div>
                      <span className="text-sm font-medium">Achievements</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center">
                        <Star className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-violet-500/20 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                        <Target className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">3 badges earned</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Powerful Features for{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-violet-400">
                Smarter Learning
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create, take, and analyze quizzes effectively in one powerful platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-card/30 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                About{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-violet-400">
                  QuizAI
                </span>
              </h2>
              <p className="text-muted-foreground mb-6">
                QuizAI is a revolutionary adaptive learning platform that combines the power of artificial
                intelligence with proven educational methodologies to create a personalized learning experience
                for every student.
              </p>
              <p className="text-muted-foreground mb-6">
                Our mission is to make quality education accessible and engaging for everyone. Whether you're
                a student looking to improve your grades or a teacher seeking efficient assessment tools,
                QuizAI has you covered.
              </p>
              <div className="space-y-3">
                {aboutChecklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square max-w-md mx-auto rounded-2xl bg-linear-to-br from-primary/20 via-primary/5 to-transparent p-8 border border-primary/20">
                <div className="h-full flex flex-col justify-center items-center gap-8">
                  <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center">
                    <Brain className="h-12 w-12 text-primary-foreground" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-primary mb-2">QuizAI</h3>
                    <p className="text-muted-foreground">Adaptive Learning Platform</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">AI</div>
                      <div className="text-xs text-muted-foreground">Powered</div>
                    </div>
                    <div className="w-px bg-border" />
                    <div className="text-center">
                      <div className="text-2xl font-bold">24/7</div>
                      <div className="text-xs text-muted-foreground">Available</div>
                    </div>
                    <div className="w-px bg-border" />
                    <div className="text-center">
                      <div className="text-2xl font-bold">Free</div>
                      <div className="text-xs text-muted-foreground">To Start</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Our{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-violet-400">
                Services
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive solutions for both students and educators to achieve their learning goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Students */}
            <Card className="p-8 border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                  <GraduationCap className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">For Students</h3>
                  <p className="text-sm text-muted-foreground">Learn smarter, not harder</p>
                </div>
              </div>
              <ul className="space-y-3">
                {studentServices.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* For Teachers */}
            <Card className="p-8 border-violet-500/20 bg-linear-to-br from-violet-500/5 to-transparent">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Users className="h-7 w-7 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">For Teachers</h3>
                  <p className="text-sm text-muted-foreground">Empower your classroom</p>
                </div>
              </div>
              <ul className="space-y-3">
                {teacherServices.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Why QuizAI Section */}
      <section id="why-quizai" className="py-20 px-4 bg-card/30 border-y border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-violet-400">
                QuizAI
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of learners and educators who have transformed their learning experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyQuizAI.map((item, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-2xl bg-linear-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join QuizAI today and experience the future of adaptive learning. It's free to get started!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto text-base px-8" onClick={handleGetStarted}>
                Start Learning Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base px-8"
                onClick={() => openAuthModal("login")}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </div>
  );
}
