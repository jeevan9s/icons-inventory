"use client"

import { useRef } from "react"
import emailjs from "@emailjs/browser"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { emailJSPubID, emailJSServiceID, emailJSTemplateID } from "@/services/auth/utils/types";


const formSchema = z.object({
  user_name: z.string().min(2, "Name must be at least 2 characters"),
  user_email: z.string(),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export function ContactForm() {
  const formRef = useRef<HTMLFormElement | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_name: "",
      user_email: "",
      message: "",
    },
  })

  async function onSubmit() {
    if (!formRef.current) return

    try {
      await emailjs.sendForm(
        emailJSServiceID(),
        emailJSTemplateID(),
        formRef.current,
        {
          publicKey: emailJSPubID(),
        }
      )

      form.reset()
      console.log("Email sent successfully")
    } catch (error) {
      console.error("Email failed:", error)
    }
  }

  return (
  <div className="flex justify-center px-4 sm:px-6 lg:px-8">
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className="font-dm align-center w-full max-w-xl space-y-6 bg-white/80 p-8 px-12 sm:p-8 md:p-20 lg:p-20 rounded-4xl"
      >
        <FormField
          control={form.control}
          name="user_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input className="border-2 border-black/10 w-full" placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="user_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input className="border-2 border-black/10 w-full" type="email" placeholder="your@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your message"
                  className="resize-none border-2 border-black/10 w-full min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full transition-transform duration-200 hover:bg-black/80 hover:scale-[1.03] hover:cursor-pointer"
        >
          Send Message
        </Button>
      </form>
    </Form>
  </div>
)}