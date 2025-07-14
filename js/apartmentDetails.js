// Apartment details panel management - UPDATED: Green colors for title and price
class ApartmentDetailsManager {
    constructor() {
        this.isVisible = false;
        this.currentApartment = null;
        this.debugMode = true;
        this.animationDuration = 300;
    }

    // ENHANCED: Show apartment details with better animation and data handling
    showDetails(apartment) {
        if (!apartment) {
            Utils.warn('No apartment data provided to showDetails');
            return;
        }
        
        if (this.debugMode) {
            Utils.log('📋 Showing details for apartment:', apartment.id);
            console.log('🔍 Full apartment object:', apartment);
        }
        
        this.currentApartment = apartment;
        
        // MOBILE FIX: Hide view switcher on mobile when apartment details appear
        if (window.innerWidth <= 768) {
            const viewSwitcher = document.querySelector('.view-switcher');
            if (viewSwitcher) {
                viewSwitcher.style.display = 'none';
            }
            // Add body class for CSS targeting
            document.body.classList.add('apartment-details-open');
        }
        
        // Update title with enhanced formatting
        this.updateDetailsTitle(apartment);
        
        // Update content with enhanced data processing
        this.updateDetailsContent(apartment);
        
        // Show panel with smooth animation
        this.showDetailsPanel();
    }

    // UPDATED: Title with GREEN color
    updateDetailsTitle(apartment) {
        const title = document.getElementById('apartmentTitle');
        if (title) {
            // UPDATED: GREEN color for apartment title
            title.innerHTML = `
                <span style="color: #9ACD32;">${i18nManager.t('apartment-no')} ${apartment.id}</span>
            `;
        }
    }

    // ENHANCED: Show details panel with smooth animation
    showDetailsPanel() {
        const panel = document.getElementById('apartmentDetails');
        if (panel) {
            panel.style.display = 'block';
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(-50%) scale(0.9)';
            
            this.isVisible = true;
            
            requestAnimationFrame(() => {
                panel.style.transition = `all ${this.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                panel.style.opacity = '1';
                panel.style.transform = 'translateY(-50%) scale(1)';
            });
            
            this.addKeyboardListeners();
            
            if (this.debugMode) {
                Utils.log('✅ Apartment details panel shown');
            }
        }
    }

    // ENHANCED: Hide apartment details with smooth animation
    hideDetails() {
        const panel = document.getElementById('apartmentDetails');
        if (panel && this.isVisible) {
            panel.style.transition = `all ${this.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(-50%) scale(0.9)';
            
            setTimeout(() => {
                panel.style.display = 'none';
                this.isVisible = false;
                this.currentApartment = null;
                
                // MOBILE FIX: Show view switcher again on mobile when apartment details hide
                if (window.innerWidth <= 768) {
                    const viewSwitcher = document.querySelector('.view-switcher');
                    if (viewSwitcher) {
                        viewSwitcher.style.display = 'flex';
                    }
                    // Remove body class
                    document.body.classList.remove('apartment-details-open');
                }
            }, this.animationDuration);
            
            this.removeKeyboardListeners();
            
            if (svgManager) {
                svgManager.clearSelectedState();
            }
            
            if (this.debugMode) {
                Utils.log('✅ Apartment details panel hidden');
            }
        }
    }

    // COMPLETELY FIXED: Update details content with proper Google Sheets data processing
    updateDetailsContent(apartment) {
        const container = document.getElementById('detailsContent');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Add status badge with enhanced styling
        const statusBadge = this.createEnhancedStatusBadge(apartment.status);
        container.appendChild(statusBadge);
        
        if (this.debugMode) {
            console.log('🔍 Processing apartment data:', apartment);
            console.log('🔍 Available data fields:', apartment.data ? Object.keys(apartment.data) : 'No data object');
        }
        
        // CRITICAL FIX: Process and display apartment data properly but SKIP apartment ID to avoid duplication
        if (apartment.data && Object.keys(apartment.data).length > 0) {
            this.addGoogleSheetsData(container, apartment);
        } else {
            // Fallback for apartments without detailed data
            this.addFallbackDetails(container, apartment);
        }
    }

    // FIXED: Process Google Sheets data but skip apartment ID duplication
    addGoogleSheetsData(container, apartment) {
        console.log('📊 Processing Google Sheets data for apartment:', apartment.id);
        
        let visibleFieldCount = 0;
        
        // SIMPLE: Just process ALL fields that have values - no complex filtering
        Object.entries(apartment.data).forEach(([subject, fieldData]) => {
            // Only show fields that have actual values
            if (fieldData.value && fieldData.value.toString().trim() !== '') {
                // FIXED: Skip status fields to avoid duplication with status badge
                // FIXED: Skip apartment ID fields to avoid duplication with title
                if (!this.isStatusField(fieldData, subject) && !this.isApartmentIdField(fieldData, subject, apartment.id)) {
                    const detailItem = this.createEnhancedDetailItem(subject, fieldData, apartment);
                    if (detailItem) {
                        container.appendChild(detailItem);
                        visibleFieldCount++;
                        console.log(`✅ Added field: ${subject} = ${fieldData.value}`);
                    }
                }
            }
        });
        
        console.log(`📋 Displayed ${visibleFieldCount} fields for apartment ${apartment.id}`);
        
        // If no fields, show fallback
        if (visibleFieldCount === 0) {
            this.addFallbackDetails(container, apartment);
        }
    }

    // ENHANCED: Create status badge with improved styling
    createEnhancedStatusBadge(status) {
        const badge = document.createElement('div');
        badge.className = `status-badge ${status}`;
        
        // Use i18n status text
        const statusText = i18nManager.getStatusDisplay(status);
        badge.textContent = statusText;
        
        // Add status icon
        const icon = this.getStatusIcon(status);
        if (icon) {
            badge.innerHTML = `${icon} ${statusText}`;
        }
        
        // FIXED: Remove black rectangle container - return badge directly
        const container = document.createElement('div');
        container.style.cssText = `
            margin-bottom: 1.5rem;
            text-align: center;
        `;
        container.appendChild(badge);
        
        return container;
    }

    // Get status icon
    getStatusIcon(status) {
        const icons = {
            'available': '✅',
            'reserved': '🔒',
            'sold': '❌'
        };
        return icons[status] || '';
    }

    // Get status text in Macedonian
    getStatusText(status) {
        return CONFIG.STATUS_DISPLAY[status] || status;
    }

    // Get status color
    getStatusColor(status) {
        const colors = {
            'available': '#10b981',
            'reserved': '#3b82f6',
            'sold': '#ef4444'
        };
        return colors[status] || '#9ca3af';
    }

    // ENHANCED: Create detail item with improved formatting and link detection
    createEnhancedDetailItem(subject, fieldData, apartment) {
        const item = document.createElement('div');
        item.className = 'detail-item';
        
        const label = document.createElement('span');
        label.className = 'detail-label';
        
        // NEW: Use translated subject name based on current language
        let displaySubject = subject; // fallback to original
        
        if (this.debugMode) {
            console.log(`[DEBUG] Processing subject: "${subject}" for language: "${i18nManager.getCurrentLanguage()}"`);
            console.log(`[DEBUG] fieldData.subjects:`, fieldData.subjects);
        }

        if (fieldData.subjects) {
            const currentLang = i18nManager.getCurrentLanguage();
            displaySubject = fieldData.subjects[currentLang] || fieldData.subjects.mk || subject;
        }
        label.textContent = displaySubject + ':';
        label.style.color = '#ffffff'; // WHITE LABELS
        
        if (this.debugMode) {
            console.log(`[DEBUG] Final displaySubject: "${displaySubject}"`);
        }

        const value = document.createElement('span');
        value.className = 'detail-value';
        
        // Enhanced value processing
        let displayValue = fieldData.value;
        
        if (this.debugMode) {
            console.log(`🔍 Processing field "${subject}": "${fieldData.value}" (keyword: "${fieldData.filterKeyword}")`);
        }
        
        // FIXED: BATHROOM handling (no m² for bathrooms) - check this BEFORE area fields
        if (this.isBathroomField(fieldData, subject)) {
            const bathrooms = parseInt(fieldData.value);
            if (!isNaN(bathrooms)) {
                displayValue = `${bathrooms}`; // Just number, no m²
                value.style.color = '#ffffff'; // WHITE TEXT
                value.style.fontWeight = '600';
            }
        }
        // ENHANCED STATUS handling with Macedonian text
        else if (this.isStatusField(fieldData, subject)) {
            const statusValue = fieldData.value.toString().trim();
            const statusText = i18nManager.getStatusDisplay(apartment.status);
            
            value.style.color = this.getStatusColor(apartment.status);
            value.style.fontWeight = 'bold';
            displayValue = `${this.getStatusIcon(apartment.status)} ${statusText}`;
            
            if (this.debugMode) {
                console.log(`✅ Status field processed: "${statusValue}" → "${statusText}"`);
            }
        }
        // ENHANCED LINK handling with better detection
        else if (this.isLinkField(fieldData, subject)) {
            return this.createLinkItem(subject, fieldData);
        }
        // ENHANCED AREA handling
        else if (this.isAreaField(fieldData, subject)) {
            const areaValue = parseFloat(fieldData.value);
            if (!isNaN(areaValue)) {
                displayValue = `${areaValue} m²`;
                value.style.color = '#ffffff'; // WHITE TEXT
                value.style.fontWeight = '600';
            }
        }
        // FIXED: ROOM AREA handling (corridors, living rooms, work areas, utilities)
        else if (this.isRoomAreaField(fieldData, subject)) {
            const areaValue = parseFloat(fieldData.value);
            if (!isNaN(areaValue)) {
                displayValue = `${areaValue} m²`;
                value.style.color = '#ffffff'; // WHITE TEXT
                value.style.fontWeight = '600';
            }
        }
        // UPDATED: PRICE handling - GREEN COLOR
        else if (this.isPriceField(fieldData, subject)) {
            // FIXED: Better price parsing to handle commas
            const priceStr = fieldData.value.replace(/[^\d.,]/g, '');
            const price = parseFloat(priceStr.replace(',', ''));
            if (!isNaN(price)) {
                displayValue = `€${price.toLocaleString()}`;
                value.style.color = '#9ACD32'; // CHANGED: GREEN COLOR for price
                value.style.fontWeight = '600';
            }
        }
        // ENHANCED FLOOR handling
        else if (this.isFloorField(fieldData, subject)) {
            const floor = parseInt(fieldData.value);
            if (!isNaN(floor)) {
                displayValue = i18nManager.getFloorText(floor);
                value.style.color = '#ffffff'; // WHITE TEXT
                value.style.fontWeight = '600';
            }
        }
        // ENHANCED BEDROOM handling
        else if (this.isBedroomField(fieldData, subject)) {
            const bedrooms = parseInt(fieldData.value);
            if (!isNaN(bedrooms)) {
                displayValue = `${bedrooms} ${i18nManager.getBedroomText(bedrooms)}`;
                value.style.color = '#ffffff'; // WHITE TEXT
                value.style.fontWeight = '600';
            }
        }
        // DEFAULT: Make all other text white
        else {
            value.style.color = '#ffffff'; // WHITE TEXT
        }
        
        value.innerHTML = displayValue;
        
        item.appendChild(label);
        item.appendChild(value);
        
        return item;
    }

    // Enhanced field type detection methods
    isStatusField(fieldData, subject) {
        const keyword = fieldData.filterKeyword?.toLowerCase() || '';
        const subjectLower = subject.toLowerCase();
        return keyword === 'status' || subjectLower.includes('status') || subjectLower.includes('статус');
    }

    // NEW: Detect apartment ID fields to avoid duplication
    isApartmentIdField(fieldData, subject, apartmentId) {
        const keyword = fieldData.filterKeyword?.toLowerCase() || '';
        const subjectLower = subject.toLowerCase();
        const value = fieldData.value?.toString().trim() || '';
        
        // Check if this field contains the apartment ID
        return (subjectLower.includes('стан') || subjectLower.includes('apartment') || 
                subjectLower.includes('id') || keyword.includes('id')) && 
               value === apartmentId;
    }

    isLinkField(fieldData, subject) {
        const keyword = fieldData.filterKeyword?.toLowerCase() || '';
        const subjectLower = subject.toLowerCase();
        const value = fieldData.value?.toString() || '';
        
        return (keyword.includes('album') || keyword.includes('show') ||
                subjectLower.includes('покажи албум') || subjectLower.includes('album') ||
                subjectLower.includes('view') || subjectLower.includes('link') ||
                subjectLower.includes('покажи')) ||
                /^https?:\/\//i.test(value);
    }

    isAreaField(fieldData, subject) {
        const keyword = fieldData.filterKeyword?.toLowerCase() || '';
        const subjectLower = subject.toLowerCase();
        return keyword === 'area' || keyword === 'net area' || 
               subjectLower.includes('вкупно') && subjectLower.includes('м²');
    }

    // FIXED: Room area field detection (corridors, living rooms, work areas, utilities)
    isRoomAreaField(fieldData, subject) {
        const subjectLower = subject.toLowerCase();
        return subjectLower.includes('коридор') || 
               subjectLower.includes('дневна') || 
               subjectLower.includes('работна') || 
               subjectLower.includes('утилити') ||
               (subjectLower.includes('пр.') && subjectLower.includes('м²'));
    }

    isPriceField(fieldData, subject) {
        const keyword = fieldData.filterKeyword?.toLowerCase() || '';
        const subjectLower = subject.toLowerCase();
        return keyword === 'price' || subjectLower.includes('price') || 
               subjectLower.includes('цена') || subjectLower.includes('цена');
    }

    isFloorField(fieldData, subject) {
        const keyword = fieldData.filterKeyword?.toLowerCase() || '';
        const subjectLower = subject.toLowerCase();
        return keyword.includes('floor') || subjectLower.includes('floor') || 
               subjectLower.includes('спрат');
    }

    isBedroomField(fieldData, subject) {
        const keyword = fieldData.filterKeyword?.toLowerCase() || '';
        const subjectLower = subject.toLowerCase();
        return keyword.includes('bedroom') || subjectLower.includes('bedroom') || 
               subjectLower.includes('спални') || subjectLower.includes('соби');
    }

    // FIXED: Add bathroom field detection (more specific to avoid conflicts)
    isBathroomField(fieldData, subject) {
        const keyword = fieldData.filterKeyword?.toLowerCase() || '';
        const subjectLower = subject.toLowerCase();
        return (keyword.includes('bathroom') || 
                (subjectLower.includes('бањи') && !subjectLower.includes('м²')) ||
                (subjectLower.includes('бани') && !subjectLower.includes('м²'))) &&
                !subjectLower.includes('м²'); // Explicitly exclude m² fields
    }

    // ENHANCED: Create link item with better styling and security
    createLinkItem(subject, fieldData) {
        const item = document.createElement('div');
        item.className = 'detail-item';
        
        const label = document.createElement('span');
        label.className = 'detail-label';
        
        // NEW: Use translated subject name based on current language
        let displaySubject = subject; // fallback to original
        if (fieldData.subjects) {
            const currentLang = i18nManager.getCurrentLanguage();
            displaySubject = fieldData.subjects[currentLang] || fieldData.subjects.mk || subject;
        }
        label.textContent = displaySubject + ':';
        label.style.color = '#ffffff'; // WHITE LABELS
        
        const linkValue = fieldData.value?.toString().trim();
        
        if (linkValue && /^https?:\/\/\S+/i.test(linkValue)) {
            const linkElement = document.createElement('a');
            linkElement.href = linkValue;
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer'; // Security
            linkElement.className = 'detail-value link-value';
            linkElement.innerHTML = '🔗 Link'; // Keep it simple
            linkElement.innerHTML = `🔗 ${i18nManager.t('link')}`;
            
            // Enhanced link styling - KEEP ORIGINAL LINK COLOR
            linkElement.style.cssText = `
                color: #06b6d4 !important;
                text-decoration: none !important;
                font-weight: bold !important;
                padding: 0.25rem 0.5rem !important;
                border-radius: 6px !important;
                background: rgba(6, 182, 212, 0.1) !important;
                transition: all 0.3s ease !important;
            `;
            
            linkElement.addEventListener('mouseenter', () => {
                linkElement.style.backgroundColor = 'rgba(6, 182, 212, 0.2)';
                linkElement.style.color = '#0891b2';
            });
            
            linkElement.addEventListener('mouseleave', () => {
                linkElement.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
                linkElement.style.color = '#06b6d4';
            });
            
            item.appendChild(label);
            item.appendChild(linkElement);
            
            if (this.debugMode) {
                console.log(`🔗 Created link for "${subject}": ${linkValue}`);
            }
        } else {
            const textValue = document.createElement('span');
            textValue.className = 'detail-value';
            textValue.textContent = i18nManager.t('link');
            textValue.style.color = '#ffffff'; // WHITE TEXT
            
            item.appendChild(label);
            item.appendChild(textValue);
        }
        
        return item;
    }

    // ENHANCED: Add fallback details for apartments without detailed data
    addFallbackDetails(container, apartment) {
        const details = [
            // REMOVED: apartment ID to avoid duplication with title
            { label: i18nManager.t('bedrooms'), value: apartment.bedrooms || i18nManager.t('na') },
            { label: i18nManager.t('floor'), value: apartment.floor ? i18nManager.getFloorText(apartment.floor) : i18nManager.t('na') },
            { label: i18nManager.t('area'), value: apartment.area ? `${apartment.area} m²` : i18nManager.t('na') },
            { label: i18nManager.t('status'), value: i18nManager.getStatusDisplay(apartment.status) }
        ];
        
        details.forEach(detail => {
            if (detail.value && detail.value !== i18nManager.t('na')) {
                const item = document.createElement('div');
                item.className = 'detail-item';
                
                const label = document.createElement('span');
                label.className = 'detail-label';
                label.textContent = detail.label + ':';
                label.style.color = '#ffffff'; // WHITE LABELS
                
                const value = document.createElement('span');
                value.className = 'detail-value';
                value.textContent = detail.value;
                
                // Special styling for status
                if (detail.label === i18nManager.t('status')) {
                    value.style.color = this.getStatusColor(apartment.status);
                    value.style.fontWeight = 'bold';
                } else {
                    value.style.color = '#ffffff'; // WHITE TEXT for fallback details
                }
                
                item.appendChild(label);
                item.appendChild(value);
                container.appendChild(item);
            }
        });
    }

    // Add keyboard event listeners
    addKeyboardListeners() {
        this.keyboardHandler = (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hideDetails();
            }
        };
        document.addEventListener('keydown', this.keyboardHandler);
    }

    // Remove keyboard event listeners
    removeKeyboardListeners() {
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
            this.keyboardHandler = null;
        }
    }

    // Get current apartment info
    getCurrentApartment() {
        return this.currentApartment;
    }

    // Check if details are visible
    isDetailsVisible() {
        return this.isVisible;
    }
}

// Global function for HTML onclick handler
function closeApartmentDetails() {
    apartmentDetailsManager.hideDetails();
}

// Create global instance
const apartmentDetailsManager = new ApartmentDetailsManager();