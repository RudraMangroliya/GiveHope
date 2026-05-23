import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CreditCard, Coins, User, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import LoadingState from '../components/LoadingState';
import { API_BASE_URL } from '../config';

interface Campaign {
  _id: string;
  title: string;
  description: string;
  category: string;
  goal: number;
  raised: number;
  image: string;
}

const steps = [
  { id: 1, name: 'Support Cause', icon: Coins },
  { id: 2, name: 'Your Details', icon: User },
  { id: 3, name: 'Fulfill', icon: CreditCard },
  { id: 4, name: 'Complete', icon: Check },
];

const DonationFlow = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    amount: 50,
    customAmount: '',
    donorName: '',
    email: '',
    message: '',
    donationType: 'money' as 'money' | 'item',
    itemCategory: 'clothes',
    quantity: '1',
    quantityUnit: 'items',
    pickupType: 'pickup' as 'pickup' | 'dropoff',
    pickupAddress: '',
    pickupPhone: '',
    pickupTime: 'morning'
  });
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill user details if logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.name && parsed.email) {
          setFormData(prev => ({
            ...prev,
            donorName: parsed.name,
            email: parsed.email
          }));
        }
      } catch (error) {
        console.error('Failed to parse stored user details', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/campaigns/${campaignId}`);
        setCampaign(res.data);
      } catch (error) {
        console.error('Failed to fetch campaign details', error);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchCampaignDetails();
    }
  }, [campaignId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [currentStep]);

  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [loading]);

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const limitedValue = rawValue.slice(0, 16);
    const formattedValue = limitedValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    setPaymentData({ ...paymentData, cardNumber: formattedValue });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const limitedValue = rawValue.slice(0, 4);
    
    let formattedValue = limitedValue;
    if (limitedValue.length >= 3) {
      formattedValue = `${limitedValue.slice(0, 2)}/${limitedValue.slice(2)}`;
    } else if (limitedValue.length === 2 && e.target.value.length > paymentData.expiryDate.length) {
      formattedValue = `${limitedValue}/`;
    }
    
    setPaymentData({ ...paymentData, expiryDate: formattedValue });
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setPaymentData({ ...paymentData, cvc: rawValue.slice(0, 4) });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/donations`, {
        campaignId,
        amount: formData.donationType === 'item' ? 0 : (formData.amount || Number(formData.customAmount)),
        donorName: formData.donorName,
        email: formData.email,
        message: formData.message,
        donationType: formData.donationType,
        itemCategory: formData.donationType === 'item' ? formData.itemCategory : undefined,
        quantity: formData.donationType === 'item' ? Number(formData.quantity) : undefined,
        quantityUnit: formData.donationType === 'item' ? formData.quantityUnit : undefined,
        pickupType: formData.donationType === 'item' ? formData.pickupType : undefined,
        pickupAddress: formData.donationType === 'item' && formData.pickupType === 'pickup' ? formData.pickupAddress : undefined,
        pickupPhone: formData.donationType === 'item' ? formData.pickupPhone : undefined,
        pickupTime: formData.donationType === 'item' && formData.pickupType === 'pickup' ? formData.pickupTime : undefined,
      });
      setCurrentStep(4);
    } catch (error) {
      console.error('Donation failed', error);
      alert('Failed to process donation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step validation rules
  const isStep1Disabled = formData.donationType === 'money'
    ? (!formData.amount && (!formData.customAmount || Number(formData.customAmount) <= 0))
    : (!formData.quantity || Number(formData.quantity) <= 0);

  const isStep3Disabled = formData.donationType === 'money'
    ? (paymentData.cardNumber.length < 19 || paymentData.expiryDate.length < 5 || paymentData.cvc.length < 3)
    : (formData.pickupPhone.trim().length < 10 || (formData.pickupType === 'pickup' && formData.pickupAddress.trim().length < 5));

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-4 sm:mb-6">Choose Support Method</h3>
            
            {/* Donation Type Tab Toggle */}
            <div className="flex flex-col min-[320px]:flex-row bg-slate-100 p-1 rounded-2xl mb-6 max-w-xs sm:max-w-sm mx-auto border border-slate-200/20 gap-1 min-[320px]:gap-0">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, donationType: 'money' })}
                className={`w-full min-[320px]:flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 ${
                  formData.donationType === 'money'
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-100/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Donate Money
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, donationType: 'item' })}
                className={`w-full min-[320px]:flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 ${
                  formData.donationType === 'item'
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-100/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Donate Items
              </button>
            </div>

            {formData.donationType === 'money' ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {[25, 50, 100, 250].map((amount) => (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      key={amount}
                      onClick={() => setFormData({ ...formData, amount, customAmount: '' })}
                      className={`py-2.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-colors duration-300 cursor-pointer ${
                        formData.amount === amount 
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2 shadow-lg shadow-indigo-200' 
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-600 hover:text-indigo-600 shadow-sm'
                      }`}
                    >
                      ₹{amount}
                    </motion.button>
                  ))}
                </div>
                <div className="mt-4 sm:mt-6">
                  <label htmlFor="donor-custom-amount" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Or enter custom amount</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600">
                      <span className="text-gray-500 text-xs sm:text-sm group-focus-within:text-indigo-600">₹</span>
                    </div>
                    <input
                      type="number"
                      id="donor-custom-amount"
                      name="custom-amount"
                      min="1"
                      value={formData.customAmount}
                      onChange={(e) => {
                        if (Number(e.target.value) >= 0 || e.target.value === '') {
                          setFormData({ ...formData, customAmount: e.target.value, amount: 0 });
                        }
                      }}
                      className="pl-7 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs min-[320px]:text-sm sm:text-lg py-2 sm:py-3 border px-2.5 sm:px-4 transition-shadow focus:shadow-md"
                      placeholder="Other amount"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="item-category" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Item Category</label>
                    <select
                      id="item-category"
                      name="item-category"
                      value={formData.itemCategory}
                      onChange={(e) => setFormData({ ...formData, itemCategory: e.target.value })}
                      className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 sm:py-3 border px-2.5 sm:px-4 transition-shadow focus:shadow-md text-xs min-[320px]:text-sm sm:text-base bg-white"
                    >
                      <option value="clothes">Clothes & Garments</option>
                      <option value="books">Books & Stationery</option>
                      <option value="food">Dry Food & Rations</option>
                      <option value="blankets">Blankets & Linens</option>
                      <option value="toys">Toys & Playkits</option>
                      <option value="other">Other Supplies</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 min-[300px]:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="item-quantity" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Quantity</label>
                      <input
                        type="number"
                        id="item-quantity"
                        name="item-quantity"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => {
                          if (Number(e.target.value) >= 1 || e.target.value === '') {
                            setFormData({ ...formData, quantity: e.target.value });
                          }
                        }}
                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 sm:py-3 border px-2.5 sm:px-4 transition-shadow focus:shadow-md text-xs min-[320px]:text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label htmlFor="item-unit" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Unit</label>
                      <select
                        id="item-unit"
                        name="item-unit"
                        value={formData.quantityUnit}
                        onChange={(e) => setFormData({ ...formData, quantityUnit: e.target.value })}
                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 sm:py-3 border px-2.5 sm:px-4 transition-shadow focus:shadow-md text-xs min-[320px]:text-sm sm:text-base bg-white"
                      >
                        <option value="items">Items / Pcs</option>
                        <option value="boxes">Boxes</option>
                        <option value="kg">KG</option>
                        <option value="packets">Packets</option>
                        <option value="bags">Bags</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 sm:pt-6">
              <motion.button
                whileHover={isStep1Disabled ? {} : { scale: 1.03, boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.4)" }}
                whileTap={isStep1Disabled ? {} : { scale: 0.97 }}
                onClick={handleNext}
                disabled={isStep1Disabled}
                className="w-full sm:w-auto bg-indigo-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold shadow-md transition-all duration-300 disabled:opacity-50 disabled:bg-gray-300 disabled:shadow-none text-sm sm:text-base cursor-pointer"
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-4 sm:mb-6">Your Details</h3>
            <div>
              <label htmlFor="donor-name" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                id="donor-name"
                name="donor-name"
                value={formData.donorName}
                onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 sm:py-3 border px-2.5 sm:px-4 transition-shadow focus:shadow-md text-xs min-[320px]:text-sm sm:text-base"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="donor-email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                id="donor-email"
                name="donor-email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 sm:py-3 border px-2.5 sm:px-4 transition-shadow focus:shadow-md text-xs min-[320px]:text-sm sm:text-base"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label htmlFor="donor-message" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Message of Support (Optional)</label>
              <textarea
                id="donor-message"
                name="donor-message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 sm:py-3 border px-2.5 sm:px-4 transition-shadow focus:shadow-md text-xs min-[320px]:text-sm sm:text-base resize-none"
                placeholder="Keep up the great work!"
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-2.5 sm:gap-3 pt-4 sm:pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="w-full sm:w-auto bg-gray-100 text-gray-700 px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm sm:text-base cursor-pointer"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={(!formData.donorName || !isValidEmail(formData.email)) ? {} : { scale: 1.02, boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.4)" }}
                whileTap={(!formData.donorName || !isValidEmail(formData.email)) ? {} : { scale: 0.98 }}
                onClick={handleNext}
                disabled={!formData.donorName || !isValidEmail(formData.email)}
                className="w-full sm:w-auto bg-indigo-600 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold shadow-md transition-all duration-300 disabled:opacity-50 disabled:bg-gray-300 disabled:shadow-none text-sm sm:text-base cursor-pointer"
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 30, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
            className="space-y-4 sm:space-y-6"
          >
            {formData.donationType === 'money' ? (
              <>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-4 sm:mb-6">Payment Details</h3>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-center sm:text-left">
                  <p className="text-indigo-800 text-xs sm:text-sm font-medium">
                    You are donating <strong className="text-base sm:text-lg">₹{formData.amount || formData.customAmount}</strong> to <strong className="text-base sm:text-lg">{campaign?.title || 'this campaign'}</strong>.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="donor-card-number" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Card Number</label>
                    <input 
                      type="text" 
                      id="donor-card-number"
                      name="card-number"
                      value={paymentData.cardNumber}
                      onChange={handleCardNumberChange}
                      className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 sm:py-3 border px-2.5 sm:px-4 transition-shadow focus:shadow-md text-xs min-[320px]:text-sm sm:text-base" 
                      placeholder="0000 0000 0000 0000" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label htmlFor="donor-card-expiry" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Expiry Date</label>
                      <input 
                        type="text" 
                        id="donor-card-expiry"
                        name="card-expiry"
                        value={paymentData.expiryDate}
                        onChange={handleExpiryChange}
                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 sm:py-3 border px-2.5 sm:px-4 transition-shadow focus:shadow-md text-xs min-[320px]:text-sm sm:text-base" 
                        placeholder="MM/YY" 
                      />
                    </div>
                    <div>
                      <label htmlFor="donor-card-cvc" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">CVC</label>
                      <input 
                        type="text" 
                        id="donor-card-cvc"
                        name="card-cvc"
                        value={paymentData.cvc}
                        onChange={handleCvcChange}
                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 sm:py-3 border px-2.5 sm:px-4 transition-shadow focus:shadow-md text-xs min-[320px]:text-sm sm:text-base" 
                        placeholder="123" 
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-4 sm:mb-6">Collection Schedule</h3>
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-center sm:text-left">
                  <p className="text-indigo-800 text-xs sm:text-sm font-medium">
                    You are contributing <strong className="text-base sm:text-lg">{formData.quantity} {formData.quantityUnit}</strong> of <strong className="text-base sm:text-lg">{formData.itemCategory}</strong> to <strong className="text-base sm:text-lg">{campaign?.title || 'this campaign'}</strong>.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Pickup Type Selector */}
                  <div className="flex flex-col min-[320px]:flex-row bg-slate-100 p-1 rounded-2xl max-w-xs sm:max-w-sm mx-auto border border-slate-200/20 gap-1 min-[320px]:gap-0">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, pickupType: 'pickup' })}
                      className={`w-full min-[320px]:flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                        formData.pickupType === 'pickup'
                          ? 'bg-white text-indigo-600 shadow-sm border border-slate-100/50'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Home Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, pickupType: 'dropoff' })}
                      className={`w-full min-[320px]:flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                        formData.pickupType === 'dropoff'
                          ? 'bg-white text-indigo-600 shadow-sm border border-slate-100/50'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Self Drop-off
                    </button>
                  </div>

                  {formData.pickupType === 'pickup' ? (
                    <div className="space-y-4 pt-2">
                      <div>
                        <label htmlFor="pickup-address" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Pickup Address</label>
                        <textarea
                          id="pickup-address"
                          name="pickup-address"
                          value={formData.pickupAddress}
                          onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                          rows={3}
                          className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 sm:py-3 border px-2.5 sm:px-4 transition-shadow focus:shadow-md text-xs min-[320px]:text-sm sm:text-base resize-none"
                          placeholder="Enter complete pickup address with landmarks"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="pickup-phone" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Contact Phone</label>
                          <input
                            type="tel"
                            id="pickup-phone"
                            name="pickup-phone"
                            maxLength={10}
                            value={formData.pickupPhone}
                            onChange={(e) => setFormData({ ...formData, pickupPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                            className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 sm:py-3 border px-2.5 sm:px-4 transition-shadow focus:shadow-md text-xs min-[320px]:text-sm sm:text-base"
                            placeholder="10-digit mobile number"
                          />
                        </div>
                        <div>
                          <label htmlFor="pickup-time" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Preferred Time Window</label>
                          <select
                            id="pickup-time"
                            name="pickup-time"
                            value={formData.pickupTime}
                            onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                            className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 sm:py-3 border px-2.5 sm:px-4 transition-shadow focus:shadow-md text-xs min-[320px]:text-sm sm:text-base bg-white"
                          >
                            <option value="morning">Morning (9:00 AM - 12:00 PM)</option>
                            <option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
                            <option value="evening">Evening (4:00 PM - 8:00 PM)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2 text-slate-600">
                        <p className="font-bold text-slate-800">Drop-off Address:</p>
                        <p>GiveHope Center, Hub 2, Connaught Place, New Delhi - 110001</p>
                        <p>⏰ <strong>Timings:</strong> 9:00 AM - 6:00 PM (Monday to Saturday)</p>
                      </div>
                      <div>
                        <label htmlFor="pickup-phone" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Your Contact Phone</label>
                        <input
                          type="tel"
                          id="pickup-phone"
                          name="pickup-phone"
                          maxLength={10}
                          value={formData.pickupPhone}
                          onChange={(e) => setFormData({ ...formData, pickupPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 sm:py-3 border px-2.5 sm:px-4 transition-shadow focus:shadow-md text-xs min-[320px]:text-sm sm:text-base"
                          placeholder="10-digit mobile number"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
 
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-2.5 sm:gap-3 pt-4 sm:pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBack}
                className="w-full sm:w-auto bg-gray-100 text-gray-700 px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm sm:text-base cursor-pointer"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={isStep3Disabled || isSubmitting ? {} : { scale: 1.02, boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.4)" }}
                whileTap={isStep3Disabled || isSubmitting ? {} : { scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isStep3Disabled || isSubmitting}
                className="w-full sm:w-auto bg-indigo-600 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold shadow-md transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:scale-100 relative overflow-hidden group text-sm sm:text-base min-w-[120px] cursor-pointer"
              >
                <div className="absolute inset-0 h-full w-full bg-indigo-700 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out z-0"></div>
                <span className="relative z-10 flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    formData.donationType === 'item' ? 'Confirm Donation' : `Donate ₹${formData.amount || formData.customAmount}`
                  )}
                </span>
              </motion.button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
            className="text-center py-6 sm:py-10 space-y-4 sm:space-y-6"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 10 }}
              className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 sm:mb-6"
            >
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
            </motion.div>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl sm:text-3xl font-extrabold text-gray-900 px-2"
            >
              Thank You, {formData.donorName}!
            </motion.h3>
            <p className="text-sm sm:text-lg text-gray-600 max-w-md mx-auto px-4 leading-relaxed">
              {formData.donationType === 'item' ? (
                <>
                  Your item donation of <strong>{formData.quantity} {formData.quantityUnit}</strong> of <strong>{formData.itemCategory}</strong> has been successfully registered. 
                  {formData.pickupType === 'pickup' 
                    ? ' Our dispatch team will contact you to coordinate pickup at your address.' 
                    : ' Please drop them off at our CP hub center at your convenience.'}
                </>
              ) : (
                <>
                  Your generous donation of <strong>₹{formData.amount || formData.customAmount}</strong> has been successfully processed. 
                </>
              )}{' '}
              Thank you for supporting <strong>{campaign?.title || 'our cause'}</strong>. Together, we are making a difference.
            </p>
            <div className="pt-6 sm:pt-8 px-4 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => navigate('/profile')}
                className="w-full sm:w-auto bg-indigo-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-colors text-sm sm:text-base cursor-pointer"
              >
                Track Donation Status
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full sm:w-auto bg-white text-slate-600 border border-slate-200 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors text-sm sm:text-base cursor-pointer"
              >
                Return Home
              </button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingState message="Connecting to secure gateway..." height="h-96" />;
  }
 
  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
      {/* Back Button */}
      <div className="mb-4 sm:mb-6 mt-1 flex justify-start">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs sm:text-sm transition-colors duration-300 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Campaigns</span>
        </button>
      </div>

      {/* Timeline UI */}
      <div className="max-w-[280px] min-[360px]:max-w-[320px] min-[480px]:max-w-[380px] sm:max-w-[440px] md:max-w-[480px] mx-auto mb-12 sm:mb-16 mt-2 px-1">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 sm:h-1 bg-gray-200 rounded-full -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-0.5 sm:h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full -z-10 transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id <= currentStep;
            const isCurrent = step.id === currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isActive ? '#059669' : '#ffffff',
                    borderColor: isActive ? '#059669' : '#e5e7eb',
                    scale: isCurrent ? 1.15 : 1,
                  }}
                  className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 sm:border-4 flex items-center justify-center transition-colors duration-300 ${
                    isActive 
                      ? 'text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                      : 'text-gray-400 border-gray-200 bg-white'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>
                <span className={`stepper-label absolute top-full mt-2 sm:mt-3 left-1/2 -translate-x-1/2 text-[9px] min-[360px]:text-[10px] sm:text-xs md:text-sm font-bold tracking-tight text-center leading-tight transition-colors duration-300 ${
                  isCurrent ? 'block' : 'hidden sm:block'
                } ${
                  isActive ? 'text-indigo-600 font-extrabold' : 'text-slate-400 font-medium'
                }`}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
 
      <motion.div layout className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-2.5 min-[300px]:p-3.5 sm:p-8 md:p-12 overflow-hidden min-h-[300px] sm:min-h-[400px]">
        {campaign && currentStep < 4 && (
          <div className="flex items-center gap-3.5 p-3 sm:p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 mb-6 shrink-0">
            <img 
              src={campaign.image} 
              alt={campaign.title} 
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 shadow-sm border border-white"
            />
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-0.5 sm:mb-1">You are supporting</span>
              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 truncate leading-snug">{campaign.title}</h4>
            </div>
          </div>
        )}
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DonationFlow;
