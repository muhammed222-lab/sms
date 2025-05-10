/* eslint-disable @typescript-eslint/no-unused-vars */
import { Client } from "@gradio/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Debug: Log the incoming request
    console.log("Incoming request to /api/support");

    // First, check if there's any body content
    if (!request.body) {
      console.error("Request body is empty");
      return NextResponse.json(
        { error: "Request body is empty" },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
      console.log("Parsed request body:", body);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { message, system_message, max_tokens, temperature, top_p } = body;

    // Validate required fields
    if (!message) {
      console.error("Message is missing in request");
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Enhanced connection handling
    let client;
    try {
      console.log("Attempting to connect to Gradio client...");
      client = await Client.connect(
        "https://muhammednetrcdev-smsglobe-llm-api.hf.space/"
      );
      console.log("Successfully connected to Gradio client");
    } catch (error) {
      console.error("Failed to connect to Gradio client:", error);
      return NextResponse.json(
        { error: "Failed to connect to chat service" },
        { status: 503 }
      );
    }

    // Make the prediction request with better error handling
    try {
      console.log("Making prediction request with params:", {
        message,
        system_message: system_message || "You are a friendly Chatbot.",
        max_tokens: max_tokens || 512,
        temperature: temperature || 0.7,
        top_p: top_p || 0.95,
      });

      const result = await client.predict("/chat", {
        message: message,
        system_message: system_message || "You are a friendly Chatbot.",
        max_tokens: max_tokens || 512,
        temperature: temperature || 0.7,
        top_p: top_p || 0.95,
      });

      console.log("Received response from API:", result.data);

      return NextResponse.json({
        response: result.data,
      });
    } catch (error) {
      console.error("Error during prediction:", error);
      return NextResponse.json(
        {
          error: "Chat service returned an error",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in SMS Globe API integration:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
