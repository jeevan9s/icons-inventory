"use client";
import Navbar from "../components/Navbar";
import { ContactForm } from "../components/ContactForm";

export default function support() {
return (
  <div className="min-h-screen flex flex-col items-center bg-neutral-100 select-none">
    <Navbar pageType="main" />

    <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex flex-col lg:flex-row lg:gap-16 gap-10 w-full max-w-6xl">

        <div className="flex flex-col gap-4 lg:w-1/2">
          <h1 className="font-thin text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-black font-mp">
            Support
          </h1>

          <h3 className="text-black/80 font-med font-mp text-base sm:text-lg md:text-xl lg:text-2xl">
            Access the manual and learn about website actions.
          </h3> 

          <div className="max-w-sm">
            <p className="text-black/60 font-sm font-mp">
              We're here to help! Expect a response within 24-48 hours.
              The manual is not finished yet, but here's information on key website actions:
            </p>
          </div>
          
          <h2 className="text-2xl font-semibold text-black font-mp">Key Website Actions Guide (guide is not finished but here are some actions to start guide with)</h2>
          <ul className="list-disc text-black/60 pl-6 sm:pl-10 font-mp space-y-1">
            <li className="font-mp">Adding or managing inventory items</li>
            <li>Processing loans and returns</li>
            <li>Viewing reports and analytics</li>
            <li>Configuring user permissions</li>
            <li>Troubleshooting sync issues</li>
          </ul>
        </div>

        <div className="flex flex-col lg:w-1/2 gap-4">
          <h2 className="text-2xl font-semibold text-black font-mp">User Manual</h2>
          <p className="text-black/60 font-mp">
            Our comprehensive user manual is currently under development. It will provide step-by-step guides for using the Icons Inventory system effectively. Check back soon for updates!
          </p>

          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>

    <div className="px-6 py-4 w-full text-center">
      <p className="text-black/80 font-mp text-sm">built for the iCons</p>
    </div>
  </div>
);
}
