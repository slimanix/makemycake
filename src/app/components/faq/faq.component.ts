import { Component } from '@angular/core';

interface FAQItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  templateUrl: './faq.component.html'
})
export class FAQComponent {
  searchQuery: string = '';
  selectedCategory: string = '';
  
  faqItems: FAQItem[] = [
    {
      question: 'How do I place an order?',
      answer: 'Browse our selection of cakes, select your desired item, customize it according to your preferences, and proceed to checkout. You\'ll need to create an account or sign in to complete your order.',
      isOpen: false
    },
    {
      question: 'What are your delivery areas?',
      answer: 'We deliver to most major cities and surrounding areas. Enter your delivery address during checkout to see if we service your location.',
      isOpen: false
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and digital payment methods including PayPal and Apple Pay.',
      isOpen: false
    },
    {
      question: 'Can I modify or cancel my order?',
      answer: 'Orders can be modified or cancelled up to 48 hours before the scheduled delivery time. Contact our customer service team for assistance.',
      isOpen: false
    }
  ];

  toggleFAQ(index: number) {
    this.faqItems[index].isOpen = !this.faqItems[index].isOpen;
  }

  filterFAQs(category: string) {
    this.selectedCategory = category;
    // Add filtering logic here
  }

  searchFAQs(query: string) {
    this.searchQuery = query;
    // Add search logic here
  }
} 