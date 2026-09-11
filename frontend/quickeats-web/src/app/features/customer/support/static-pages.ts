import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="static-page">
      <h1>About QuickEats</h1>
      <p class="lead">Delivering happiness, one bite at a time.</p>
      <div class="content-box">
        <p>QuickEats is a premium food delivery platform that connects customers with their favorite local restaurants. Founded in 2026, our mission is to provide a lightning-fast, seamless ordering experience with real-time tracking, transparent pricing, and quality customer care.</p>
        <p>Our network of dedicated delivery partners ensures your meals arrive hot and fresh, while our handpicked restaurant partners offer a rich variety of cuisines satisfying every craving.</p>
      </div>
    </div>
  `,
  styles: [`
    .static-page { max-width: 850px; margin: 40px auto; padding: 0 24px; }
    h1 { font-size: 32px; font-weight: 800; color: #1B2838; margin-bottom: 8px; text-align: center; }
    .lead { font-size: 16px; color: #E85D3A; font-weight: 600; margin-bottom: 24px; text-align: center; }
    .content-box { background: white; padding: 36px; border-radius: 16px; box-shadow: 0 4px 16px rgba(27,40,56,0.06); color: #3D4F63; line-height: 1.8; font-size: 15px; border: 1px solid #E8ECF1; }
  `]
})
export class AboutComponent {}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="static-page">
      <h1>Contact Us</h1>
      <p class="lead">Get in touch with the QuickEats team.</p>
      <div class="content-box">
        <p><strong>Customer Support:</strong> support&#64;quickeats.com</p>
        <p><strong>Hotline:</strong> +91 98765 43210 (Available 24/7)</p>
        <p><strong>Corporate Office:</strong> QuickEats Tech Hub, Bandra West, Mumbai, Maharashtra - 400050</p>
        <p>For instant assistance regarding active orders or refunds, please visit our <a routerLink="/help" style="color:#E85D3A;font-weight:600;">Help & Support</a> page.</p>
      </div>
    </div>
  `,
  styles: [`
    .static-page { max-width: 850px; margin: 40px auto; padding: 0 24px; }
    h1 { font-size: 32px; font-weight: 800; color: #1B2838; margin-bottom: 8px; text-align: center; }
    .lead { font-size: 16px; color: #E85D3A; font-weight: 600; margin-bottom: 24px; text-align: center; }
    .content-box { background: white; padding: 36px; border-radius: 16px; box-shadow: 0 4px 16px rgba(27,40,56,0.06); color: #3D4F63; line-height: 1.8; font-size: 15px; border: 1px solid #E8ECF1; }
  `]
})
export class ContactComponent {}

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="static-page">
      <h1>Terms & Conditions</h1>
      <p class="lead">Rules and guidelines governing your use of QuickEats.</p>
      <div class="content-box">
        <section class="policy-section">
          <h3>1. Introduction</h3>
          <p>Welcome to QuickEats. By accessing or using our website, mobile interface, and services, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use the platform.</p>
        </section>

        <section class="policy-section">
          <h3>2. User Responsibilities</h3>
          <p>Users are responsible for providing accurate delivery details, maintaining account confidentiality, and ensuring lawful use of our ordering services. Impersonation, false orders, or fraudulent transactions will result in immediate account termination.</p>
        </section>

        <section class="policy-section">
          <h3>3. Orders</h3>
          <p>All orders placed via QuickEats are subject to restaurant confirmation and item availability. Estimated delivery times are indicative and may vary based on weather, traffic, and kitchen preparation load.</p>
        </section>

        <section class="policy-section">
          <h3>4. Payments</h3>
          <p>Payments can be made via digital payment methods (Credit/Debit Card, UPI, Net Banking) or Cash on Delivery. Prices shown are inclusive of applicable restaurant menu charges and taxes.</p>
        </section>

        <section class="policy-section">
          <h3>5. Cancellations</h3>
          <p>Orders may only be cancelled while in the "Pending" status. Once the restaurant begins food preparation or assigns a delivery partner, cancellation is no longer possible.</p>
        </section>

        <section class="policy-section">
          <h3>6. Refunds</h3>
          <p>Eligible refunds for valid cancellations or order issues are credited back to the customer's original payment method within 5–7 business days.</p>
        </section>

        <section class="policy-section">
          <h3>7. Account Usage</h3>
          <p>Each customer is permitted one primary personal account. You must notify QuickEats immediately if you suspect unauthorized access or security breaches.</p>
        </section>

        <section class="policy-section">
          <h3>8. Service Availability</h3>
          <p>We strive for uninterrupted platform uptime; however, service availability may vary based on location, operating hours, and scheduled maintenance windows.</p>
        </section>

        <section class="policy-section">
          <h3>9. Contact Information</h3>
          <p>For questions or disputes regarding these Terms, please reach out to our legal compliance team at <strong>legal&#64;quickeats.com</strong>.</p>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .static-page { max-width: 850px; margin: 40px auto; padding: 0 24px; }
    h1 { font-size: 32px; font-weight: 800; color: #1B2838; margin-bottom: 8px; text-align: center; }
    .lead { font-size: 16px; color: #E85D3A; font-weight: 600; margin-bottom: 24px; text-align: center; }
    .content-box { background: white; padding: 36px; border-radius: 16px; box-shadow: 0 4px 16px rgba(27,40,56,0.06); color: #3D4F63; line-height: 1.8; font-size: 15px; border: 1px solid #E8ECF1; }
    .policy-section { margin-bottom: 24px; }
    .policy-section:last-child { margin-bottom: 0; }
    h3 { color: #1B2838; margin: 0 0 8px; font-size: 18px; font-weight: 700; }
  `]
})
export class TermsComponent {}

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="static-page">
      <h1>Privacy Policy</h1>
      <p class="lead">How QuickEats collects, safeguards, and manages your personal data.</p>
      <div class="content-box">
        <section class="policy-section">
          <h3>1. Information Collected</h3>
          <p>We collect essential information required to deliver our services, including your name, email address, contact phone number, delivery addresses, and order history.</p>
        </section>

        <section class="policy-section">
          <h3>2. How Information is Used</h3>
          <p>Your details are used exclusively to process orders, assign delivery partners, provide customer support, and communicate order tracking updates.</p>
        </section>

        <section class="policy-section">
          <h3>3. Orders and Payments</h3>
          <p>Payment transactions are processed securely through certified payment gateways. QuickEats never stores raw credit/debit card numbers or sensitive CVVs on its servers.</p>
        </section>

        <section class="policy-section">
          <h3>4. Cookies</h3>
          <p>We use session tokens and basic cookies to authenticate your session, maintain items in your cart, and retain your delivery preferences.</p>
        </section>

        <section class="policy-section">
          <h3>5. Data Security</h3>
          <p>We enforce cryptographic password hashing (BCrypt), JWT bearer token security, HTTPS encryption, and restricted database access to safeguard customer information.</p>
        </section>

        <section class="policy-section">
          <h3>6. Third-Party Services</h3>
          <p>We share only necessary delivery details (such as address and phone number) with assigned restaurant owners and delivery partners to fulfill your meal orders.</p>
        </section>

        <section class="policy-section">
          <h3>7. User Rights</h3>
          <p>You have the right to access, update, or request the deletion of your personal profile data at any time via your Profile page or by contacting support.</p>
        </section>

        <section class="policy-section">
          <h3>8. Contact</h3>
          <p>For privacy inquiries or data protection requests, please contact our Data Protection Officer at <strong>privacy&#64;quickeats.com</strong>.</p>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .static-page { max-width: 850px; margin: 40px auto; padding: 0 24px; }
    h1 { font-size: 32px; font-weight: 800; color: #1B2838; margin-bottom: 8px; text-align: center; }
    .lead { font-size: 16px; color: #E85D3A; font-weight: 600; margin-bottom: 24px; text-align: center; }
    .content-box { background: white; padding: 36px; border-radius: 16px; box-shadow: 0 4px 16px rgba(27,40,56,0.06); color: #3D4F63; line-height: 1.8; font-size: 15px; border: 1px solid #E8ECF1; }
    .policy-section { margin-bottom: 24px; }
    .policy-section:last-child { margin-bottom: 0; }
    h3 { color: #1B2838; margin: 0 0 8px; font-size: 18px; font-weight: 700; }
  `]
})
export class PrivacyComponent {}

@Component({
  selector: 'app-refund-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="static-page">
      <h1>Refund & Cancellation Policy</h1>
      <p class="lead">Clear guidelines on order modifications, cancellations, and refunds.</p>
      <div class="content-box">
        <section class="policy-section">
          <h3>1. Order Cancellation</h3>
          <p>Customers can cancel an order free of charge while its status is "Pending". Once the restaurant accepts and begins preparing your order, cancellation is no longer possible.</p>
        </section>

        <section class="policy-section">
          <h3>2. Restaurant Cancellation</h3>
          <p>If a restaurant partner is unable to fulfill an order due to item unavailability or unforeseen kitchen closure, the order is promptly cancelled and a 100% refund is initiated automatically.</p>
        </section>

        <section class="policy-section">
          <h3>3. Payment Failure</h3>
          <p>If money is debited from your account but the order is not confirmed, our automated reconciliation system releases the transaction and your bank processes the refund within 24–48 hours.</p>
        </section>

        <section class="policy-section">
          <h3>4. Refund Eligibility</h3>
          <p>Refunds apply to: (a) Orders cancelled during Pending status, (b) Orders cancelled by the restaurant, or (c) Documented delivery failure. Partial refunds or credits may be issued for missing or incorrect items.</p>
        </section>

        <section class="policy-section">
          <h3>5. Refund Processing</h3>
          <p>Approved refunds are processed to your original payment method within 5–7 business days, depending on your bank or card issuer's clearing cycle.</p>
        </section>

        <section class="policy-section">
          <h3>6. Non-Refundable Situations</h3>
          <p>Refunds are not granted if: (a) An incorrect or unreachable delivery address was provided, (b) The customer is unavailable to receive the order upon partner arrival, or (c) The order is cancelled after food preparation starts.</p>
        </section>

        <section class="policy-section">
          <h3>7. Contact Support</h3>
          <p>If you have any questions or would like to submit a refund query, please visit our <a routerLink="/help" style="color:#E85D3A;font-weight:600;">Help & Support</a> page or email <strong>refunds&#64;quickeats.com</strong>.</p>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .static-page { max-width: 850px; margin: 40px auto; padding: 0 24px; }
    h1 { font-size: 32px; font-weight: 800; color: #1B2838; margin-bottom: 8px; text-align: center; }
    .lead { font-size: 16px; color: #E85D3A; font-weight: 600; margin-bottom: 24px; text-align: center; }
    .content-box { background: white; padding: 36px; border-radius: 16px; box-shadow: 0 4px 16px rgba(27,40,56,0.06); color: #3D4F63; line-height: 1.8; font-size: 15px; border: 1px solid #E8ECF1; }
    .policy-section { margin-bottom: 24px; }
    .policy-section:last-child { margin-bottom: 0; }
    h3 { color: #1B2838; margin: 0 0 8px; font-size: 18px; font-weight: 700; }
  `]
})
export class RefundPolicyComponent {}

