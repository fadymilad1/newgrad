'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FiCheck, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function LandingPage() {
  const [currentTemplate, setCurrentTemplate] = useState(0)

  const templates = [
    {
      name: 'Modern Pharmacy',
      description: 'Clean and modern design',
      image: '/first_templete.png',
    },
    {
      name: 'Classic Pharmacy',
      description: 'Traditional design with professional look',
      image: '/sec_temp.png',  
    },
    {
      name: 'Minimal Pharmacy',
      description: 'Minimalist design focusing on products',
      image: '/third_temp.png',
    },
  ]

  const steps = [
    { 
      number: 1, 
      title: 'Choose Type', 
      description: 'Choose what kind of medical website you want to build.',
      hospital: 'Select Hospital as your website type',
      pharmacy: 'Select Pharmacy as your website type',
    },
    { 
      number: 2, 
      title: 'Select Features / Template', 
      description: 'Customize the experience for your patients and customers.',
      hospital: 'Pick hospital features and layout with clear pricing',
      pharmacy: 'Choose your pharmacy template and review included features',
    },
    { 
      number: 3, 
      title: 'Payment', 
      description: 'Secure online payment with Visa or Fawry.',
      hospital: 'Securely pay for the features you selected',
      pharmacy: 'Securely pay for your chosen template',
    },
    { 
      number: 4, 
      title: 'Enter Info & Publish', 
      description: 'Add your details and launch your website.',
      hospital: 'Add your hospital information, review, and publish your site',
      pharmacy: 'Add your pharmacy details, customize content, and publish',
    },
  ]

  const pricingPlans = [
    {
      name: 'Hospital Websites',
      price: 'From $19',
      period: 'one-time per feature',
      features: [
        'Pay once for each feature you enable (now much lower)',
        'AI Chatbot: $15/month subscription',
        'Review System: $20 one-time',
        'Ambulance Ordering: $25 one-time',
      ],
    },
    {
      name: 'Pharmacy Templates',
      price: '$15 - $25',
      period: 'one-time',
      features: [
        'Minimal Pharmacy template: $15',
        'Classic Pharmacy template: $20',
        'Modern Pharmacy + AI template: $25',
        'AI chatbot included with Modern Pharmacy template',
      ],
      popular: true,
    },
    {
      name: 'Add-ons & Extras',
      price: 'From $15',
      period: 'one-time',
      features: [
        'Prescription Refill module: $15 one-time',
        'AI Chatbot: $15/month subscription',
        'Review System: $20 one-time',
        'Extend your website later with more features anytime',
      ],
    },
  ]

  const testimonials = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      company: 'City Hospital',
      content: 'Medify helped us launch our website in just one day. The process was incredibly smooth.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Pharmacy Owner',
      company: 'HealthPlus Pharmacy',
      content: 'The templates are beautiful and the AI assistant is a game-changer for managing our online presence.',
      rating: 4,
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Clinic Director',
      company: 'Family Care Clinic',
      content: 'Best investment we made. Our patient bookings increased by 40% after launching our Medify website.',
      rating: 4,
    },
    {
      name: 'Dr. Ahmed Hassan',
      role: 'Hospital Director',
      company: 'Nile Medical Center',
      content: 'We created a professional hospital website without any technical team. The interface is very easy and clear.',
      rating: 5,
    },
    {
      name: 'Sara Youssef',
      role: 'Pharmacy Manager',
      company: 'CarePlus Pharmacy',
      content: 'Online orders and prescription refills became much easier for our patients after using Medify templates.',
      rating: 3,
    },
    {
      name: 'Dr. Omar Ali',
      role: 'Clinic Owner',
      company: 'Downtown Medical Clinic',
      content: 'The booking system and AI assistant helped us reduce phone calls and increase online appointments.',
      rating: 4,
    },
    {
      name: 'Dr. Lina Mansour',
      role: 'Pediatric Specialist',
      company: 'Family Health Hospital',
      content: 'Parents love how easy it is to find information about our doctors and book visits online.',
      rating: 5,
    },
    {
      name: 'Youssef Kamal',
      role: 'IT Manager',
      company: 'GreenLife Pharmacy Group',
      content: 'We manage multiple pharmacy websites from one place now. Medify saved us a lot of time and cost.',
      rating: 4,
    },
    {
      name: 'Dr. Mariam El-Shenawy',
      role: 'Dermatology Consultant',
      company: 'Glow Skin Clinic',
      content: 'The clean design and SEO-friendly structure helped new patients discover our clinic faster.',
      rating: 4,
    },
  ]

  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [templateTouchStart, setTemplateTouchStart] = useState(0)
  const [templateTouchEnd, setTemplateTouchEnd] = useState(0)

  // Handle touch swipe for mobile testimonials
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      setTestimonialIndex((prev) =>
        testimonials.length ? (prev + 1) % testimonials.length : 0
      )
    }
    if (isRightSwipe) {
      setTestimonialIndex((prev) =>
        testimonials.length ? (prev - 1 + testimonials.length) % testimonials.length : 0
      )
    }
    
    // Reset touch values
    setTouchStart(0)
    setTouchEnd(0)
  }

  // Handle touch swipe for mobile templates
  const handleTemplateTouchStart = (e: React.TouchEvent) => {
    setTemplateTouchStart(e.targetTouches[0].clientX)
  }

  const handleTemplateTouchMove = (e: React.TouchEvent) => {
    setTemplateTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTemplateTouchEnd = () => {
    if (!templateTouchStart || !templateTouchEnd) return
    
    const distance = templateTouchStart - templateTouchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      setCurrentTemplate((prev) => (prev + 1) % templates.length)
    }
    if (isRightSwipe) {
      setCurrentTemplate((prev) => (prev - 1 + templates.length) % templates.length)
    }
    
    // Reset touch values
    setTemplateTouchStart(0)
    setTemplateTouchEnd(0)
  }

  const handleNextTemplate = () => {
    setCurrentTemplate((prev) => (prev + 1) % templates.length)
  }

  const handlePrevTemplate = () => {
    setCurrentTemplate((prev) => (prev - 1 + templates.length) % templates.length)
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden w-full">
      {/* Navigation */}
      <nav className="border-b border-neutral-border overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="relative h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
              <Image
                src="/mod logo.png"
                alt="Medify logo"
                fill
                className="object-contain"
                sizes="40px"
                priority
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-primary">Medify</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login" className="text-sm sm:text-base text-neutral-gray hover:text-primary transition-colors">
              Login
            </Link>
            <Link href="/signup">
              <Button className="text-sm sm:text-base px-4 sm:px-6 py-2">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 overflow-x-hidden w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-dark mb-4 sm:mb-6">
              Build Your Medical Website in Minutes
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-neutral-gray mb-6 sm:mb-10 max-w-2xl">
              Create professional websites for hospitals and pharmacies with our easy-to-use platform.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link href="/signup?type=hospital" className="flex-1 sm:flex-initial">
                <Button variant="primary" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
                  Create Hospital Website
                </Button>
              </Link>
              <Link href="/signup?type=pharmacy" className="flex-1 sm:flex-initial">
                <Button variant="secondary" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4">
                  Create Pharmacy Website
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-64 sm:h-80 order-1 md:order-2 w-full max-w-full">
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl w-full">
              <Image
                src="/logo.png"
                alt="Hospital website preview"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-neutral-light py-12 sm:py-20 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-neutral-dark mb-8 sm:mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-8 sm:mb-12">
            {/* Hospital Flow */}
            <div>
              <h3 className="text-2xl font-semibold text-neutral-dark mb-6 text-center">
                Hospital
              </h3>
              <div className="space-y-6">
                {steps.map((step) => (
                  <div key={step.number} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                      {step.number}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-dark mb-1">
                        {step.title}
                      </h4>
                      <p className="text-neutral-gray text-sm">{step.hospital}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Pharmacy Flow */}
            <div>
              <h3 className="text-2xl font-semibold text-neutral-dark mb-6 text-center">
                Pharmacy
              </h3>
              <div className="space-y-6">
                {steps.map((step) => (
                  <div key={step.number} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                      {step.number}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-dark mb-1">
                        {step.title}
                      </h4>
                      <p className="text-neutral-gray text-sm">{step.pharmacy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pharmacy Templates */}
      <section className="py-12 sm:py-20 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-neutral-dark mb-8 sm:mb-12">
            Pharmacy Templates
          </h2>
          {/* Mobile: Single template with swipe (no inline styles) */}
          <div className="block md:hidden mb-6">
            <div
              className="overflow-hidden"
              onTouchStart={handleTemplateTouchStart}
              onTouchMove={handleTemplateTouchMove}
              onTouchEnd={handleTemplateTouchEnd}
            >
              <div className="px-2">
                {templates[currentTemplate] && (
                  <Card className="ring-2 ring-primary">
                    <div className="h-64 bg-neutral-light rounded-t-lg flex items-center justify-center relative overflow-hidden w-full max-w-full">
                      <Image
                        src={templates[currentTemplate].image}
                        alt={templates[currentTemplate].name}
                        fill
                        className="object-contain bg-neutral-light"
                        sizes="100vw"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-neutral-dark mb-2">
                        {templates[currentTemplate].name}
                      </h3>
                      <p className="text-neutral-gray">
                        {templates[currentTemplate].description}
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
          {/* Desktop: 3 templates grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {templates.map((template, index) => (
              <Card
                key={index}
                className={`${index === currentTemplate ? 'ring-2 ring-primary' : ''} cursor-pointer`}
                onClick={() => setCurrentTemplate(index)}
              >
                <div className="h-64 bg-neutral-light rounded-t-lg flex items-center justify-center relative overflow-hidden w-full max-w-full">
                  <Image
                    src={template.image}
                    alt={template.name}
                    fill
                    className="object-contain bg-neutral-light"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-neutral-dark mb-2">
                    {template.name}
                  </h3>
                  <p className="text-neutral-gray">{template.description}</p>
                </div>
              </Card>
            ))}
          </div>
          {/* Carousel controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handlePrevTemplate}
              className="p-2 rounded-full border border-neutral-border text-neutral-gray hover:text-primary hover:border-primary transition-colors"
              aria-label="Previous template"
            >
              <FiChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {templates.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentTemplate(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    index === currentTemplate ? 'bg-primary' : 'bg-neutral-border'
                  }`}
                  aria-label={`Go to template ${index + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleNextTemplate}
              className="p-2 rounded-full border border-neutral-border text-neutral-gray hover:text-primary hover:border-primary transition-colors"
              aria-label="Next template"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* AI Assistant Feature */}
      <section className="bg-neutral-light py-12 sm:py-20 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-neutral-dark mb-6">
                AI-Powered Assistant for Patients
              </h2>
              <p className="text-lg text-neutral-gray mb-6">
                Help your patients get instant, accurate answers to their questions 24/7. Our AI assistant understands medical terminology and supports them with clear, friendly information about services, medications, and appointments.
              </p>
              <ul className="space-y-3">
                {['Answer common patient questions', 'Guide patients to the right department or doctor', 'Support appointment booking and follow-up', 'Explain medications and pharmacy services in simple language'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <FiCheck className="text-success" size={20} />
                    <span className="text-neutral-dark">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-lg w-full max-w-full">
              <div className="bg-neutral-light rounded-lg p-0 h-64 overflow-hidden relative w-full max-w-full">
                <Image
                  src="/chatbot.webp"
                  alt="AI assistant chatbot helping build a medical website"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-12 sm:py-20 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-neutral-dark mb-8 sm:mb-12">
            Pricing Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-8 ${plan.popular ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="bg-primary text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-neutral-dark mb-2">
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-neutral-dark">
                    {plan.price}
                  </span>
                  <span className="text-neutral-gray"> {plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <FiCheck className="text-success" size={20} />
                      <span className="text-neutral-dark">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={plan.popular ? 'primary' : 'secondary'} className="w-full">
                  Get Started
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-neutral-light py-12 sm:py-20 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-neutral-dark mb-8 sm:mb-12">
            What Our Customers Say
          </h2>
          {/* Mobile: Single testimonial with swipe (no inline styles) */}
          <div className="block md:hidden mb-8">
            <div
              className="overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="px-2">
                {testimonials[testimonialIndex] && (
                  <Card className="p-6">
                    <div className="flex gap-1 mb-4">
                      {Array(
                        testimonials[testimonialIndex].rating
                          ? testimonials[testimonialIndex].rating
                          : 0
                      )
                        .fill(null)
                        .map((_, i) => (
                          <FiStar key={i} className="text-warning fill-warning" />
                        ))}
                    </div>
                    <p className="text-neutral-gray mb-6">
                      {testimonials[testimonialIndex].content}
                    </p>
                    <div>
                      <p className="font-semibold text-neutral-dark">
                        {testimonials[testimonialIndex].name}
                      </p>
                      <p className="text-sm text-neutral-gray">
                        {testimonials[testimonialIndex].role},{' '}
                        {testimonials[testimonialIndex].company}
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
          {/* Desktop: 3 testimonials grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
            {[
              testimonials[testimonialIndex],
              testimonials[(testimonialIndex + 1) % testimonials.length],
              testimonials[(testimonialIndex + 2) % testimonials.length],
            ].map((testimonial, index) => (
              <Card key={`${testimonial?.name}-${index}`} className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...(testimonial?.rating ? Array(testimonial.rating) : [])].map((_, i) => (
                    <FiStar key={i} className="text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-neutral-gray mb-6">{testimonial?.content}</p>
                <div>
                  <p className="font-semibold text-neutral-dark">
                    {testimonial?.name}
                  </p>
                  <p className="text-sm text-neutral-gray">
                    {testimonial?.role}, {testimonial?.company}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          {/* Testimonials carousel controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() =>
                setTestimonialIndex((prev) =>
                  testimonials.length ? (prev - 1 + testimonials.length) % testimonials.length : 0
                )
              }
              className="p-2 rounded-full border border-neutral-border text-neutral-gray hover:text-primary hover:border-primary transition-colors"
              aria-label="Previous testimonial"
            >
              <FiChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setTestimonialIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    index === testimonialIndex ? 'bg-primary' : 'bg-neutral-border'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setTestimonialIndex((prev) =>
                  testimonials.length ? (prev + 1) % testimonials.length : 0
                )
              }
              className="p-2 rounded-full border border-neutral-border text-neutral-gray hover:text-primary hover:border-primary transition-colors"
              aria-label="Next testimonial"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-dark text-white py-8 sm:py-12 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8 text-center sm:text-left">
            <div>
              <h3 className="text-xl font-bold mb-4">Medify</h3>
              <p className="text-neutral-gray">
                Building medical websites made simple.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-neutral-gray">
                <li>Features</li>
                <li>Pricing</li>
                <li>Templates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-neutral-gray">
                <li>About</li>
                <li>Blog</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-neutral-gray">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>API</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-gray pt-8 text-center text-neutral-gray">
            <p>&copy; 2026 Medify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

