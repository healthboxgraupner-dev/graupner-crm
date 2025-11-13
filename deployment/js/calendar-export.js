// ===================================
// Calendar Export Functions
// Google Calendar & .ics Export
// ===================================

const calendarExport = {
    
    // ===================================
    // GENERATE .ics FILE
    // ===================================
    generateICS(event) {
        const {
            title,
            description = '',
            location = '',
            startDate,
            startTime = '09:00',
            endTime = '10:00',
            allDay = false
        } = event;

        // Parse date and time
        const start = this.parseDateTime(startDate, startTime);
        const end = this.parseDateTime(startDate, endTime);

        // Format dates for .ics
        const startStr = this.formatICSDate(start, allDay);
        const endStr = this.formatICSDate(end, allDay);
        const nowStr = this.formatICSDate(new Date(), false);

        // Generate unique ID
        const uid = `${Date.now()}@healthbox.ae`;

        // Build .ics content
        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//HealthBox CRM//Calendar Export//DE',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTAMP:${nowStr}`,
            `DTSTART${allDay ? ';VALUE=DATE' : ''}:${startStr}`,
            `DTEND${allDay ? ';VALUE=DATE' : ''}:${endStr}`,
            `SUMMARY:${this.escapeICS(title)}`,
            `DESCRIPTION:${this.escapeICS(description)}`,
            location ? `LOCATION:${this.escapeICS(location)}` : '',
            'STATUS:CONFIRMED',
            'SEQUENCE:0',
            'BEGIN:VALARM',
            'TRIGGER:-PT15M',
            'ACTION:DISPLAY',
            'DESCRIPTION:Reminder',
            'END:VALARM',
            'END:VEVENT',
            'END:VCALENDAR'
        ].filter(line => line).join('\r\n');

        return icsContent;
    },

    // ===================================
    // DOWNLOAD .ics FILE
    // ===================================
    downloadICS(event, filename = 'event') {
        const icsContent = this.generateICS(event);
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        utils.showToast('Kalendereintrag heruntergeladen! Öffnen Sie die .ics Datei in Ihrem Kalender.', 'success');
    },

    // ===================================
    // GOOGLE CALENDAR LINK
    // ===================================
    generateGoogleCalendarLink(event) {
        const {
            title,
            description = '',
            location = '',
            startDate,
            startTime = '09:00',
            endTime = '10:00'
        } = event;

        // Parse date and time
        const start = this.parseDateTime(startDate, startTime);
        const end = this.parseDateTime(startDate, endTime);

        // Format for Google Calendar (YYYYMMDDTHHmmss)
        const startStr = this.formatGoogleDate(start);
        const endStr = this.formatGoogleDate(end);

        // Build Google Calendar URL
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: title,
            details: description,
            location: location,
            dates: `${startStr}/${endStr}`
        });

        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    },

    // ===================================
    // OPEN IN GOOGLE CALENDAR
    // ===================================
    openGoogleCalendar(event) {
        const url = this.generateGoogleCalendarLink(event);
        window.open(url, '_blank');
        utils.showToast('Google Calendar wird geöffnet...', 'info');
    },

    // ===================================
    // HELPER: PARSE DATE & TIME
    // ===================================
    parseDateTime(dateStr, timeStr) {
        // dateStr format: "YYYY-MM-DD" or "DD.MM.YYYY"
        // timeStr format: "HH:MM"
        
        let year, month, day;
        
        if (dateStr.includes('-')) {
            // YYYY-MM-DD
            [year, month, day] = dateStr.split('-').map(Number);
        } else if (dateStr.includes('.')) {
            // DD.MM.YYYY
            [day, month, year] = dateStr.split('.').map(Number);
        } else {
            // Invalid format
            return new Date();
        }

        const [hours, minutes] = timeStr.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes);
    },

    // ===================================
    // HELPER: FORMAT FOR .ics
    // ===================================
    formatICSDate(date, allDay = false) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        if (allDay) {
            return `${year}${month}${day}`;
        }
        
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    },

    // ===================================
    // HELPER: FORMAT FOR GOOGLE
    // ===================================
    formatGoogleDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    },

    // ===================================
    // HELPER: ESCAPE .ics TEXT
    // ===================================
    escapeICS(text) {
        return text
            .replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '');
    },

    // ===================================
    // CREATE CALENDAR BUTTONS HTML
    // ===================================
    createCalendarButtons(event, onClickPrefix = '') {
        const googleClickHandler = onClickPrefix ? 
            `${onClickPrefix}.openGoogleCalendar` : 
            'calendarExport.openGoogleCalendar';
        
        const icsClickHandler = onClickPrefix ? 
            `${onClickPrefix}.downloadICS` : 
            'calendarExport.downloadICS';

        return `
            <div style="display: flex; gap: 10px; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--grey-light);">
                <button class="btn btn-secondary btn-sm" onclick='${googleClickHandler}(${JSON.stringify(event)})' style="flex: 1;">
                    <i class="fab fa-google"></i> Google Calendar
                </button>
                <button class="btn btn-secondary btn-sm" onclick='${icsClickHandler}(${JSON.stringify(event)}, "${this.sanitizeFilename(event.title)}")' style="flex: 1;">
                    <i class="fas fa-download"></i> .ics Download
                </button>
            </div>
        `;
    },

    // ===================================
    // HELPER: SANITIZE FILENAME
    // ===================================
    sanitizeFilename(filename) {
        return filename
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .substring(0, 50);
    },

    // ===================================
    // FOLLOWUP TO CALENDAR EVENT
    // ===================================
    followupToEvent(followup) {
        const channelEmojis = {
            'whatsapp': '💬',
            'zoom': '🎥',
            'phone': '📞',
            'email': '📧',
            'meeting': '🤝'
        };

        const emoji = channelEmojis[followup.channel] || '📅';
        const channelName = followup.channel.charAt(0).toUpperCase() + followup.channel.slice(1);

        return {
            title: `${emoji} Follow-up: ${followup.lead_name || followup.leadName}`,
            description: `Kanal: ${channelName}\n\n${followup.description || ''}`,
            location: followup.channel === 'meeting' ? 'Büro' : channelName,
            startDate: followup.date,
            startTime: '09:00',
            endTime: '10:00'
        };
    },

    // ===================================
    // CALL TO CALENDAR EVENT
    // ===================================
    callToEvent(call) {
        return {
            title: `📞 Gespräch: ${call.lead_name || call.leadName}`,
            description: `Thema: ${call.topic}\n\nErgebnis: ${call.result || ''}\n\nNächste Aktion: ${call.next_action || call.nextAction || ''}`,
            location: 'Telefonisch',
            startDate: call.date,
            startTime: '09:00',
            endTime: call.duration ? this.addMinutes('09:00', call.duration) : '10:00'
        };
    },

    // ===================================
    // REFLECTION TO CALENDAR EVENT
    // ===================================
    reflectionToEvent(reflection) {
        return {
            title: '💡 Wöchentliche Reflexion',
            description: `Neue Leads: ${reflection.new_leads || reflection.newLeads || 0}\nGespräche: ${reflection.calls_made || reflection.callsMade || 0}\nAbschlüsse: ${reflection.deals_closed || reflection.dealsClosed || 0}\n\nWas lief gut:\n${reflection.what_went_well || reflection.whatWentWell || ''}\n\nVerbesserungen:\n${reflection.what_to_improve || reflection.whatToImprove || ''}`,
            location: 'Reflexion',
            startDate: reflection.week_start || reflection.weekStart,
            startTime: '17:00',
            endTime: '18:00',
            allDay: false
        };
    },

    // ===================================
    // HELPER: ADD MINUTES TO TIME
    // ===================================
    addMinutes(timeStr, minutes) {
        const [hours, mins] = timeStr.split(':').map(Number);
        const totalMinutes = hours * 60 + mins + minutes;
        const newHours = Math.floor(totalMinutes / 60) % 24;
        const newMins = totalMinutes % 60;
        return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
    }
};
