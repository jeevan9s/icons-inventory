"use client";
import Navbar from "../components/Navbar";
import { ContactForm } from "../components/ContactForm";

export default function Contact() {
return (
  <div className="min-h-screen flex flex-col items-center bg-gray-300 select-none">
    <Navbar pageType="landing" />

    <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex flex-col lg:flex-row lg:gap-16 gap-10 w-full max-w-6xl">

        <div className="flex flex-col gap-4 lg:w-1/2">
          <h1 className="font-thin text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-black font-mp">
            Contact
          </h1>

          <h3 className="text-black/80 font-med font-mp text-base sm:text-lg md:text-xl lg:text-2xl">
            Reach out to the developers.
          </h3>

          <div className="max-w-sm">
            <p className="text-black/60 font-sm font-mp">
              You can expect a response in 2-3 business days.
              Inquiries include but are not limited to:
            </p>
          </div>

          <ul className="list-disc text-black/60 pl-6 sm:pl-10 font-mp space-y-1">
            <li className="font-mp">Adding staff</li>
            <li>Feature request</li>
            <li>Report a bug</li>
          </ul>
        </div>

        <div className="flex flex-col lg:w-1/2 gap-4">
          <ContactForm />
        </div>
      </div>
    </div>

    <div className="px-6 py-4 w-full text-center">
      <p className="text-black/80 font-mp text-sm">built for the iCons</p>
    </div>
  </div>
);
}
