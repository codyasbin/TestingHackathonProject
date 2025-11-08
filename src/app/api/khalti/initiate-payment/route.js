// app/api/khalti/initiate-payment/route.js

import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      return_url,
      website_url,
      amount,
      purchase_order_id,
      purchase_order_name,
      customer_info,
      amount_breakdown,
      product_details
    } = body;

    // Validate required fields
    if (!return_url || !website_url || !amount || !purchase_order_id || !purchase_order_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const data = {
      return_url,
      website_url,
      amount, // Amount in paisa (1 NPR = 100 paisa)
      purchase_order_id,
      purchase_order_name,
      customer_info: customer_info || {},
      amount_breakdown: amount_breakdown || [],
      product_details: product_details || [],
    };

    // Make request to Khalti API
    const response = await axios.post(
      'https://dev.khalti.com/api/v2/epayment/initiate/',
      data,
      {
        headers: {
          'Authorization': 'key b6912fc3dc4346db9259908ee1bd93cd', // Replace with your actual Khalti secret key
          'Content-Type': 'application/json'
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Khalti payment initiation error:', error.response?.data || error.message);
    return NextResponse.json(
      { 
        error: 'Payment initiation failed',
        details: error.response?.data || error.message 
      },
      { status: 500 }
    );
  }
}