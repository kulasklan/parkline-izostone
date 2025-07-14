// Analytics dashboard management
class AnalyticsManager {
    constructor() {
        this.isVisible = false;
    }

    // Show analytics dashboard
    showDashboard() {
        if (!googleSheetsManager.isLoaded) {
            Utils.warn('Cannot show analytics: data not loaded');
            return;
        }
        
        Utils.log('Showing analytics dashboard');
        
        const modal = document.getElementById('analyticsModal');
        if (!modal) return;
        
        // Update analytics content
        this.updateAnalyticsContent();
        
        // Show modal
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('visible');
            this.isVisible = true;
        }, 10);
    }

    // Hide analytics dashboard
    hideDashboard() {
        const modal = document.getElementById('analyticsModal');
        if (!modal || !this.isVisible) return;
        
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.style.display = 'none';
            this.isVisible = false;
        }, 300);
    }

    // Update analytics content
    updateAnalyticsContent() {
        const container = document.getElementById('analyticsContent');
        if (!container) return;
        
        const analytics = googleSheetsManager.getAnalytics();
        
        container.innerHTML = '';
        
        // Create analytics cards
        const cards = [
            {
                title: i18nManager.t('total-apartments'),
                value: analytics.total,
                label: i18nManager.t('units')
            },
            {
                title: i18nManager.t('available'),
                value: analytics.available,
                label: `${analytics.availablePercentage}% ${i18nManager.t('percent-of-total')}`
            },
            {
                title: i18nManager.t('reserved'),
                value: analytics.reserved,
                label: `${analytics.reservedPercentage}% ${i18nManager.t('percent-of-total')}`
            },
            {
                title: i18nManager.t('sold'),
                value: analytics.sold,
                label: `${analytics.soldPercentage}% ${i18nManager.t('percent-of-total')}`
            }
        ];
        
        cards.forEach(cardData => {
            const card = this.createAnalyticsCard(cardData);
            container.appendChild(card);
        });
        
        // Add bedroom statistics
        const bedroomCard = this.createBedroomStatsCard(analytics.bedroomStats);
        container.appendChild(bedroomCard);
        
        // Add Google Sheets status
        const statusCard = this.createDataStatusCard();
        container.appendChild(statusCard);
    }

    // Create analytics card
    createAnalyticsCard(data) {
        const card = document.createElement('div');
        card.className = 'analytics-card';
        
        card.innerHTML = `
            <h3>${data.title}</h3>
            <div class="value">${data.value}</div>
            <div class="label">${data.label}</div>
        `;
        
        return card;
    }

    // Create bedroom statistics card
    createBedroomStatsCard(bedroomStats) {
        const card = document.createElement('div');
        card.className = 'analytics-card';
        card.style.gridColumn = 'span 2';
        
        let statsHTML = `<h3>${i18nManager.t('bedroom-distribution')}</h3>`;
        
        Object.entries(bedroomStats).forEach(([bedrooms, count]) => {
            const percentage = Math.round((count / googleSheetsManager.apartments.length) * 100);
            statsHTML += `
                <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
                    <span>${bedrooms} ${i18nManager.t('bedrooms-label')}</span>
                    <span>${count} ${i18nManager.t('units')} (${percentage}%)</span>
                </div>
            `;
        });
        
        card.innerHTML = statsHTML;
        return card;
    }

    // Create data status card
    createDataStatusCard() {
        const card = document.createElement('div');
        card.className = 'analytics-card';
        card.style.gridColumn = 'span 2';
        
        const dataSource = googleSheetsManager.data ? 'Google Sheets' : 'Sample Data';
        const lastUpdate = new Date().toLocaleString();
        
        card.innerHTML = `
            <h3>${i18nManager.t('data-status')}</h3>
            <div style="text-align: left;">
                <div style="margin: 0.5rem 0;">
                    <strong>${i18nManager.t('source')}</strong> ${dataSource}
                </div>
                <div style="margin: 0.5rem 0;">
                    <strong>${i18nManager.t('last-update')}</strong> ${lastUpdate}
                </div>
                <div style="margin: 0.5rem 0;">
                    <strong>${i18nManager.t('apartments-loaded')}</strong> ${googleSheetsManager.apartments.length}
                </div>
                <div style="margin: 0.5rem 0;">
                    <strong>${i18nManager.t('current-view')}</strong> ${i18nManager.t(svgManager.currentView === 1 ? 'view-1' : 'view-2')}
                </div>
            </div>
        `;
        
        return card;
    }
}

// Global functions for HTML onclick handlers
function showAnalyticsDashboard() {
    analyticsManager.showDashboard();
}

function closeAnalyticsDashboard() {
    analyticsManager.hideDashboard();
}

// Create global instance
const analyticsManager = new AnalyticsManager();