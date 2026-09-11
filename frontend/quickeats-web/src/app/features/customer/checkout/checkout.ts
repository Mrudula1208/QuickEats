import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CheckoutService } from '../../../core/services/checkout.service';
import { CheckoutDataService } from '../../../core/services/checkout-data.service';
import { CartService } from '../../../core/services/cart.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { SavedAddressService } from '../../../core/services/saved-address.service';
import { CheckoutModel } from '../../../core/models/checkout.model';
import { CartItem } from '../../../core/models/cart-item.model';
import { SavedAddressModel } from '../../../core/models/saved-address.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class CheckoutComponent {

  customerCartItems = signal<CartItem[]>([]);
  savedAddresses = signal<SavedAddressModel[]>([]);
  submitted = false;
  errors: { [key: string]: string } = {};
  selectedAddressId: number | null = null;
  showAddAddress = false;
  isPlacing = false;

  newAddress: SavedAddressModel = {
    addressId: 0,
    customerName: '',
    phoneNumber: '',
    houseNumber: '',
    area: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'Home',
    isDefault: false
  };

  customerCheckout: CheckoutModel = {
    deliveryAddress: '',
    landmark: '',
    phoneNumber: '',
    deliveryInstruction: '',
    paymentMethod: 'Cash On Delivery',
    couponCode: '',
    subTotal: 0,
    gstAmount: 0,
    deliveryCharge: 0,
    platformFee: 10,
    discountAmount: 0,
    grandTotal: 0,
    rewardPoints: 0
  };

  constructor(
    public cartService: CartService,
    private restaurantService: RestaurantService,
    private checkoutService: CheckoutService,
    private checkoutData: CheckoutDataService,
    private savedAddressService: SavedAddressService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.customerCartItems = this.cartService.cartItems;
    this.loadRestaurantSettings();
    this.loadAddresses();
    this.calculateBill();
  }

  loadRestaurantSettings(): void {
    const firstItem = this.customerCartItems()[0];
    if (!firstItem) return;

    this.restaurantService
      .getRestaurantById(firstItem.menu.restaurantId)
      .subscribe({
        next: (data) => {
          this.cartService.setDeliverySettings(data.deliveryCharge, 500, data.minimumOrder);
          this.calculateBill();
        },
        error: () => {}
      });
  }

  loadAddresses(): void {
    this.savedAddressService.getAddresses().subscribe({
      next: (data) => {
        this.savedAddresses.set(data);
        const defaultAddr = data.find(a => a.isDefault);
        if (defaultAddr) {
          this.selectAddress(defaultAddr);
        }
      },
      error: () => {}
    });
  }

  selectAddress(addr: SavedAddressModel): void {
    this.selectedAddressId = addr.addressId;
    this.customerCheckout.deliveryAddress = `${addr.houseNumber}, ${addr.area}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
    this.customerCheckout.landmark = addr.landmark;
    this.customerCheckout.phoneNumber = addr.phoneNumber;
    this.errors = {};
  }

  toggleAddAddress(): void {
    this.showAddAddress = !this.showAddAddress;
  }

  saveNewAddress(): void {
    if (!this.newAddress.houseNumber || !this.newAddress.area || !this.newAddress.city || !this.newAddress.phoneNumber) {
      this.toastr.warning('Please fill in required address fields');
      return;
    }
    this.savedAddressService.addAddress(this.newAddress).subscribe({
      next: (saved) => {
        this.savedAddresses.set([...this.savedAddresses(), saved]);
        this.selectAddress(saved);
        this.showAddAddress = false;
        this.newAddress = {
          addressId: 0, customerName: '', phoneNumber: '', houseNumber: '',
          area: '', landmark: '', city: '', state: '', pincode: '',
          addressType: 'Home', isDefault: false
        };
        this.toastr.success('Address saved successfully');
      },
      error: () => { this.toastr.error('Failed to save address'); }
    });
  }

  selectPayment(method: string): void {
    this.customerCheckout.paymentMethod = method;
  }

  validateForm(): boolean {
    this.errors = {};

    if (this.cartService.isBelowMinimumOrder()) {
      this.errors['minimumOrder'] = `Minimum order is ₹${this.cartService.minimumOrder()}.`;
    }

    if (!this.customerCheckout.deliveryAddress.trim()) {
      this.errors['deliveryAddress'] = 'Delivery address is required.';
    } else if (this.customerCheckout.deliveryAddress.trim().length < 5) {
      this.errors['deliveryAddress'] = 'Delivery address must be at least 5 characters.';
    } else if (this.customerCheckout.deliveryAddress.trim().length > 500) {
      this.errors['deliveryAddress'] = 'Delivery address cannot exceed 500 characters.';
    }

    if (!this.customerCheckout.phoneNumber.trim()) {
      this.errors['phoneNumber'] = 'Phone number is required.';
    } else if (!/^\d{10,15}$/.test(this.customerCheckout.phoneNumber.trim())) {
      this.errors['phoneNumber'] = 'Please enter a valid 10 to 15 digit phone number.';
    }

    return Object.keys(this.errors).length === 0;
  }

  calculateBill(): void {
    this.customerCheckout.subTotal = this.cartService.getFoodTotal();
    this.customerCheckout.gstAmount = this.cartService.getGstAmount();
    this.customerCheckout.platformFee = this.cartService.getPlatformFee();
    this.customerCheckout.deliveryCharge = this.cartService.getDeliveryFee();
    this.customerCheckout.discountAmount = this.cartService.getCouponDiscount();
    this.customerCheckout.couponCode = this.cartService.getCouponCode();
    this.customerCheckout.rewardPoints = Math.floor(this.customerCheckout.subTotal / 100);
    this.customerCheckout.grandTotal =
      this.customerCheckout.subTotal +
      this.customerCheckout.gstAmount +
      this.customerCheckout.deliveryCharge +
      this.customerCheckout.platformFee -
      this.customerCheckout.discountAmount;
  }

  placeOrder(): void {
    this.submitted = true;
    this.isPlacing = true;

    if (!this.validateForm()) {
      this.isPlacing = false;
      return;
    }

    this.checkoutService.saveCheckoutDetails(this.customerCheckout);

    this.checkoutData.address =
      this.customerCheckout.deliveryAddress +
      (this.customerCheckout.landmark ? ', ' + this.customerCheckout.landmark : '');

    this.checkoutData.phone = this.customerCheckout.phoneNumber;
    this.checkoutData.cartItems = this.cartService.cartItems();
    this.checkoutData.total = this.customerCheckout.grandTotal;
    this.checkoutData.foodTotal = this.customerCheckout.subTotal;
    this.checkoutData.gstAmount = this.customerCheckout.gstAmount;
    this.checkoutData.deliveryFee = this.customerCheckout.deliveryCharge;
    this.checkoutData.platformFee = this.customerCheckout.platformFee;
    this.checkoutData.couponDiscount = this.customerCheckout.discountAmount;
    this.checkoutData.paymentMethod = this.customerCheckout.paymentMethod;

    this.router.navigate(['/payment']);
  }
}
