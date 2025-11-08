// app/api/khalti/payment-callback/route.js

import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pidx = searchParams.get('pidx');
    const status = searchParams.get('status');
    const transaction_id = searchParams.get('transaction_id');
    const tidx = searchParams.get('tidx');
    const amount = searchParams.get('amount');
    const mobile = searchParams.get('mobile');
    const purchase_order_id = searchParams.get('purchase_order_id');
    const purchase_order_name = searchParams.get('purchase_order_name');

    console.log('Payment callback received:', {
      pidx,
      status,
      transaction_id,
      tidx,
      amount,
      mobile,
      purchase_order_id,
      purchase_order_name
    });

    // Here you can:
    // 1. Verify the payment with Khalti's lookup API
    // 2. Update your database with payment status
    // 3. Send confirmation email to user
    // 4. Update booking status

    // Redirect to success page with payment details
    const redirectUrl = new URL('/checkout/success', request.url);
    redirectUrl.searchParams.set('pidx', pidx || '');
    redirectUrl.searchParams.set('status', status || '');
    redirectUrl.searchParams.set('purchase_order_id', purchase_order_id || '');
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Payment callback error:', error);
    
    // Redirect to error page
    const redirectUrl = new URL('/checkout/error', request.url);
    return NextResponse.redirect(redirectUrl);
  }
}