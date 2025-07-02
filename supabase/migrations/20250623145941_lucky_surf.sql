/*
  # Add German B2 Level Sample Vocabulary

  This migration adds approximately 100 German words with English translations
  specifically for the user ozgurakanay@gmail.com. These are B2-level daily life
  related vocabulary words to demonstrate the application functionality.

  1. Target User
    - Email: ozgurakanay@gmail.com
    - Words will only be visible to this specific user

  2. Word Selection Criteria
    - B2 level complexity (intermediate-advanced)
    - Daily life related vocabulary
    - Mix of nouns, verbs, adjectives, and expressions
    - Useful for practical German communication

  3. Word Categories
    - Household and living
    - Work and career
    - Health and wellness
    - Transportation and travel
    - Social interactions
    - Technology and modern life
    - Food and dining
    - Shopping and services
*/

-- First, we need to get the user ID for ozgurakanay@gmail.com
-- We'll use a DO block to insert the words only if the user exists

DO $$
DECLARE
    target_user_id uuid;
    word_data record;
    next_review_date timestamptz;
BEGIN
    -- Get the user ID for ozgurakanay@gmail.com
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'ozgurakanay@gmail.com';
    
    -- Only proceed if the user exists
    IF target_user_id IS NOT NULL THEN
        -- Set next review date to tomorrow
        next_review_date := now() + interval '1 day';
        
        -- Insert German B2 vocabulary words
        INSERT INTO words (user_id, word, definition, difficulty, next_review) VALUES
        -- Household and Living
        (target_user_id, 'die Haushaltsführung', 'household management, running a household', 'new', next_review_date),
        (target_user_id, 'der Mietvertrag', 'rental agreement, lease contract', 'new', next_review_date),
        (target_user_id, 'die Nebenkosten', 'additional costs, utilities (rent)', 'new', next_review_date),
        (target_user_id, 'die Instandhaltung', 'maintenance, upkeep', 'new', next_review_date),
        (target_user_id, 'der Hausmeister', 'caretaker, building superintendent', 'new', next_review_date),
        (target_user_id, 'die Wohngemeinschaft', 'shared apartment, flatshare (WG)', 'new', next_review_date),
        (target_user_id, 'einrichten', 'to furnish, to set up (a room/apartment)', 'new', next_review_date),
        (target_user_id, 'umziehen', 'to move (to a new place)', 'new', next_review_date),
        (target_user_id, 'renovieren', 'to renovate, to refurbish', 'new', next_review_date),
        (target_user_id, 'die Kaution', 'security deposit', 'new', next_review_date),
        
        -- Work and Career
        (target_user_id, 'die Bewerbungsunterlagen', 'application documents', 'new', next_review_date),
        (target_user_id, 'das Vorstellungsgespräch', 'job interview', 'new', next_review_date),
        (target_user_id, 'die Berufserfahrung', 'professional experience', 'new', next_review_date),
        (target_user_id, 'die Weiterbildung', 'continuing education, professional development', 'new', next_review_date),
        (target_user_id, 'der Arbeitsvertrag', 'employment contract', 'new', next_review_date),
        (target_user_id, 'die Überstunden', 'overtime hours', 'new', next_review_date),
        (target_user_id, 'der Urlaubsantrag', 'vacation request', 'new', next_review_date),
        (target_user_id, 'die Gehaltsverhandlung', 'salary negotiation', 'new', next_review_date),
        (target_user_id, 'kündigen', 'to quit, to terminate (employment)', 'new', next_review_date),
        (target_user_id, 'befördert werden', 'to be promoted', 'new', next_review_date),
        
        -- Health and Wellness
        (target_user_id, 'die Krankenversicherung', 'health insurance', 'new', next_review_date),
        (target_user_id, 'der Hausarzt', 'family doctor, GP', 'new', next_review_date),
        (target_user_id, 'die Überweisung', 'referral (medical)', 'new', next_review_date),
        (target_user_id, 'die Vorsorgeuntersuchung', 'preventive medical examination', 'new', next_review_date),
        (target_user_id, 'verschreiben', 'to prescribe (medication)', 'new', next_review_date),
        (target_user_id, 'die Nebenwirkungen', 'side effects', 'new', next_review_date),
        (target_user_id, 'sich erholen', 'to recover, to rest', 'new', next_review_date),
        (target_user_id, 'die Behandlung', 'treatment, therapy', 'new', next_review_date),
        (target_user_id, 'chronisch', 'chronic (illness)', 'new', next_review_date),
        (target_user_id, 'die Physiotherapie', 'physiotherapy', 'new', next_review_date),
        
        -- Transportation and Travel
        (target_user_id, 'die Verkehrsverbindung', 'transport connection', 'new', next_review_date),
        (target_user_id, 'der Fahrplan', 'timetable, schedule', 'new', next_review_date),
        (target_user_id, 'die Verspätung', 'delay', 'new', next_review_date),
        (target_user_id, 'umsteigen', 'to change (trains/buses)', 'new', next_review_date),
        (target_user_id, 'die Monatskarte', 'monthly travel pass', 'new', next_review_date),
        (target_user_id, 'der Stau', 'traffic jam', 'new', next_review_date),
        (target_user_id, 'die Hauptverkehrszeit', 'rush hour, peak time', 'new', next_review_date),
        (target_user_id, 'parken', 'to park', 'new', next_review_date),
        (target_user_id, 'die Parkgebühr', 'parking fee', 'new', next_review_date),
        (target_user_id, 'der Führerschein', 'driving license', 'new', next_review_date),
        
        -- Social Interactions
        (target_user_id, 'sich verabreden', 'to make an appointment/date', 'new', next_review_date),
        (target_user_id, 'absagen', 'to cancel (an appointment)', 'new', next_review_date),
        (target_user_id, 'verschieben', 'to postpone, to reschedule', 'new', next_review_date),
        (target_user_id, 'einladen', 'to invite', 'new', next_review_date),
        (target_user_id, 'die Einladung', 'invitation', 'new', next_review_date),
        (target_user_id, 'sich unterhalten', 'to have a conversation', 'new', next_review_date),
        (target_user_id, 'das Missverständnis', 'misunderstanding', 'new', next_review_date),
        (target_user_id, 'sich entschuldigen', 'to apologize', 'new', next_review_date),
        (target_user_id, 'höflich', 'polite', 'new', next_review_date),
        (target_user_id, 'unhöflich', 'impolite, rude', 'new', next_review_date),
        
        -- Technology and Modern Life
        (target_user_id, 'der Internetanschluss', 'internet connection', 'new', next_review_date),
        (target_user_id, 'das WLAN', 'WiFi, wireless network', 'new', next_review_date),
        (target_user_id, 'herunterladen', 'to download', 'new', next_review_date),
        (target_user_id, 'hochladen', 'to upload', 'new', next_review_date),
        (target_user_id, 'die Software', 'software', 'new', next_review_date),
        (target_user_id, 'das Update', 'update', 'new', next_review_date),
        (target_user_id, 'der Virus', 'computer virus', 'new', next_review_date),
        (target_user_id, 'die Datensicherung', 'data backup', 'new', next_review_date),
        (target_user_id, 'online bestellen', 'to order online', 'new', next_review_date),
        (target_user_id, 'die Lieferung', 'delivery', 'new', next_review_date),
        
        -- Food and Dining
        (target_user_id, 'die Speisekarte', 'menu', 'new', next_review_date),
        (target_user_id, 'bestellen', 'to order (food)', 'new', next_review_date),
        (target_user_id, 'die Rechnung', 'bill, check', 'new', next_review_date),
        (target_user_id, 'das Trinkgeld', 'tip, gratuity', 'new', next_review_date),
        (target_user_id, 'reservieren', 'to make a reservation', 'new', next_review_date),
        (target_user_id, 'die Reservierung', 'reservation', 'new', next_review_date),
        (target_user_id, 'vegetarisch', 'vegetarian', 'new', next_review_date),
        (target_user_id, 'vegan', 'vegan', 'new', next_review_date),
        (target_user_id, 'die Allergie', 'allergy', 'new', next_review_date),
        (target_user_id, 'scharf', 'spicy, hot (food)', 'new', next_review_date),
        
        -- Shopping and Services
        (target_user_id, 'die Öffnungszeiten', 'opening hours', 'new', next_review_date),
        (target_user_id, 'geschlossen', 'closed', 'new', next_review_date),
        (target_user_id, 'der Ausverkauf', 'sale, clearance', 'new', next_review_date),
        (target_user_id, 'reduziert', 'reduced (price)', 'new', next_review_date),
        (target_user_id, 'umtauschen', 'to exchange, to return', 'new', next_review_date),
        (target_user_id, 'die Quittung', 'receipt', 'new', next_review_date),
        (target_user_id, 'die Garantie', 'warranty, guarantee', 'new', next_review_date),
        (target_user_id, 'reklamieren', 'to complain, to make a complaint', 'new', next_review_date),
        (target_user_id, 'der Kundenservice', 'customer service', 'new', next_review_date),
        (target_user_id, 'die Warteschlange', 'queue, waiting line', 'new', next_review_date),
        
        -- Banking and Finance
        (target_user_id, 'das Bankkonto', 'bank account', 'new', next_review_date),
        (target_user_id, 'die Überweisung', 'bank transfer', 'new', next_review_date),
        (target_user_id, 'überweisen', 'to transfer (money)', 'new', next_review_date),
        (target_user_id, 'abheben', 'to withdraw (money)', 'new', next_review_date),
        (target_user_id, 'einzahlen', 'to deposit', 'new', next_review_date),
        (target_user_id, 'der Geldautomat', 'ATM, cash machine', 'new', next_review_date),
        (target_user_id, 'die Kreditkarte', 'credit card', 'new', next_review_date),
        (target_user_id, 'die EC-Karte', 'debit card', 'new', next_review_date),
        (target_user_id, 'die Zinsen', 'interest (financial)', 'new', next_review_date),
        (target_user_id, 'sparen', 'to save (money)', 'new', next_review_date),
        
        -- Government and Administration
        (target_user_id, 'das Amt', 'government office, authority', 'new', next_review_date),
        (target_user_id, 'der Antrag', 'application, request', 'new', next_review_date),
        (target_user_id, 'beantragen', 'to apply for', 'new', next_review_date),
        (target_user_id, 'das Formular', 'form', 'new', next_review_date),
        (target_user_id, 'ausfüllen', 'to fill out (a form)', 'new', next_review_date),
        (target_user_id, 'die Bescheinigung', 'certificate, confirmation', 'new', next_review_date),
        (target_user_id, 'beglaubigen', 'to certify, to authenticate', 'new', next_review_date),
        (target_user_id, 'die Anmeldung', 'registration', 'new', next_review_date),
        (target_user_id, 'sich anmelden', 'to register', 'new', next_review_date),
        (target_user_id, 'die Steuererklärung', 'tax return', 'new', next_review_date),
        
        -- Additional Complex Expressions
        (target_user_id, 'sich Gedanken machen', 'to worry, to think about something', 'new', next_review_date),
        (target_user_id, 'in Frage kommen', 'to be suitable, to be an option', 'new', next_review_date),
        (target_user_id, 'zur Verfügung stehen', 'to be available', 'new', next_review_date),
        (target_user_id, 'Bescheid geben', 'to let someone know, to inform', 'new', next_review_date),
        (target_user_id, 'Rücksicht nehmen', 'to be considerate, to take into account', 'new', next_review_date),
        (target_user_id, 'sich kümmern um', 'to take care of, to look after', 'new', next_review_date),
        (target_user_id, 'sich gewöhnen an', 'to get used to', 'new', next_review_date),
        (target_user_id, 'sich beschweren über', 'to complain about', 'new', next_review_date),
        (target_user_id, 'sich freuen auf', 'to look forward to', 'new', next_review_date),
        (target_user_id, 'sich ärgern über', 'to be annoyed about', 'new', next_review_date);
        
        RAISE NOTICE 'Successfully added 100 German B2 vocabulary words for user ozgurakanay@gmail.com';
    ELSE
        RAISE NOTICE 'User ozgurakanay@gmail.com not found. No words were added.';
    END IF;
END $$;