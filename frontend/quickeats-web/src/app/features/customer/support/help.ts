import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './help.html',
  styleUrl: './help.scss'
})
export class HelpComponent {
  faqList = signal<FaqItem[]>([
    {
      category: 'Orders & Delivery',
      question: 'How do I place an order?',
      answer: 'Browse restaurants on QuickEats, select your favorite dishes and add them to your cart. When ready, go to the cart page, click checkout, select your delivery address and preferred payment method (Cash on Delivery or Online), and place your order.',
      isOpen: false
    },
    {
      category: 'Orders & Delivery',
      question: 'Can I cancel my order?',
      answer: 'Yes. You can cancel your order from the Order Details page as long as the status is "Pending" before the restaurant begins preparation. Once food preparation has begun, orders cannot be cancelled.',
      isOpen: false
    },
    {
      category: 'Orders & Delivery',
      question: 'How can I track my delivery in real time?',
      answer: 'Navigate to "Orders" from the navigation bar, click on your active order, and select "Track Order". You will see real-time status updates from order confirmation, preparation, pickup, to doorstep delivery.',
      isOpen: false
    },
    {
      category: 'Payment & Refunds',
      question: 'What payment methods do you accept?',
      answer: 'We support Cash on Delivery (COD) and Online digital payments (Cards, UPI, Net Banking).',
      isOpen: false
    },
    {
      category: 'Payment & Refunds',
      question: 'When will I receive my refund for a cancelled order?',
      answer: 'Refunds for eligible cancelled orders are processed back to the original payment method within 5–7 business days.',
      isOpen: false
    },
    {
      category: 'Payment & Refunds',
      question: 'How do I use a discount coupon?',
      answer: 'You can discover active promo codes on our Offers page or Home page. During checkout or in your Cart, enter the coupon code into the coupon field and click Apply to enjoy instant savings.',
      isOpen: false
    },
    {
      category: 'Account & Settings',
      question: 'How do I update my profile details and delivery address?',
      answer: 'Click on your profile avatar in the navigation bar to access your Profile and Saved Addresses pages where you can edit your contact details and add multiple delivery addresses.',
      isOpen: false
    },
    {
      category: 'Account & Settings',
      question: 'Is my personal and payment data safe?',
      answer: 'Yes. QuickEats uses industry-standard encryption, secure token authentication, and does not store raw payment card data.',
      isOpen: false
    }
  ]);

  selectedCategory = signal<string>('All');
  searchQuery = signal<string>('');
  isSubmitting = signal<boolean>(false);

  categories = ['All', 'Orders & Delivery', 'Payment & Refunds', 'Account & Settings'];

  contactForm = {
    name: '',
    email: '',
    subject: 'Order Help',
    orderId: '',
    message: ''
  };

  filteredFaqs = computed(() => {
    const cat = this.selectedCategory();
    const query = this.searchQuery().toLowerCase().trim();

    return this.faqList().filter(item => {
      const matchCat = cat === 'All' || item.category === cat;
      const matchQuery = !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
  });

  constructor(private toastr: ToastrService) {}

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  toggleFaq(faq: FaqItem): void {
    faq.isOpen = !faq.isOpen;
  }

  submitTicket(): void {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      this.toastr.warning('Please fill in all required fields.');
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.toastr.success('Support request submitted successfully. Our team will contact you shortly.', 'Ticket Created');
      this.contactForm = {
        name: '',
        email: '',
        subject: 'Order Help',
        orderId: '',
        message: ''
      };
    }, 600);
  }
}
