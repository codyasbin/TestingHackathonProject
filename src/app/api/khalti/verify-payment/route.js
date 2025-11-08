// app/api/khalti/verify-payment/route.js

import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const body = await request.json();
    const { pidx } = body;

    if (!pidx) {
      return NextResponse.json(
        { error: 'Missing payment index (pidx)' },
        { status: 400 }
      );
    }

    // Verify payment with Khalti lookup API
    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          'Authorization': 'key b6912fc3dc4346db9259908ee1bd93cd', // Replace with your actual Khalti secret key
          'Content-Type': 'application/json'
        }
      }
    );

    // Check if payment was successful
    const paymentData = response.data;
    
    if (paymentData.status === 'Completed') {
      // Payment successful - update your database here
      // Save booking, send confirmation email, etc.
      
      return NextResponse.json({
        success: true,
        data: paymentData
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Payment not completed',
        data: paymentData
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    return NextResponse.json(
      { 
        error: 'Payment verification failed',
        details: error.response?.data || error.message 
      },
      { status: 500 }
    );
  }
}