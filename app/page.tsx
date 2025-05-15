import React from 'react'
import Link from 'next/link'

const Home = () => {
  return (
    <main className="h-screen">
      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Welcome to the Interview Portal
            </h1>
            <p className="text-xl mb-8">
              Your gateway to professional opportunities and career growth
            </p>
            <div className="space-x-4">
              <Link 
                href="/apply" 
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Apply Now
              </Link>
              <Link 
                href="/jobs" 
                className="border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                View Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Easy Application Process</h3>
              <p className="text-gray-600">
                Streamlined application process to help you get started quickly
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Track Your Progress</h3>
              <p className="text-gray-600">
                Monitor your application status and stay updated throughout the process
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Professional Support</h3>
              <p className="text-gray-600">
                Get assistance from our team at every step of your journey
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
