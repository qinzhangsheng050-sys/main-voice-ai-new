document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const recipientInput = document.getElementById('recipient-input');
    const topicInput = document.getElementById('topic-input');
    const senderInput = document.getElementById('sender-input');
    const loadingIndicator = document.getElementById('loading-indicator');
    const generatorPreviewArea = document.querySelector('.generator-preview-area');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    
    const letterDate = document.getElementById('letter-date');
    const letterSalutation = document.getElementById('letter-salutation');
    const letterBody = document.getElementById('letter-body');
    const letterClosing = document.getElementById('letter-closing');
    const letterSender = document.getElementById('letter-sender');

    // Wait for JS libraries and AI Engine
    if (!window.jspdf) {
        console.warn('jsPDF is not loaded');
    }
    if (!window.html2canvas) {
        console.warn('html2canvas is not loaded');
    }

    generateBtn.addEventListener('click', async () => {
        const recipient = recipientInput.value.trim();
        const topic = topicInput.value.trim();
        const sender = senderInput.value.trim() || 'Your child';

        if (!recipient || !topic) {
            alert("Please tell us who the letter is for and what you'd like to say.");
            return;
        }

        // Validate model config presence
        const aiEngine = window.MainVoiceAI;
        const modelConfig = aiEngine?.currentModel === 'pro' ? aiEngine.models.pro : aiEngine.models.flash;
        if (!aiEngine || !modelConfig?.key) {
            alert("MainVoice AI engine is missing or API key is not configured.");
            return;
        }

        // Show loading state
        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.7';
        loadingIndicator.style.display = 'block';
        generatorPreviewArea.style.display = 'none';

        try {
            // Construct specific isolated prompt
            const prompt = `You are an expert therapist writing a very warm, empathetic, and non-confrontational letter from a child/young person to a parent or adult.
The user wants to communicate this: "${topic}"
To this recipient: "${recipient}"

Please write ONLY the body of the letter. Do not include the date, "Dear so-and-so", or the sign-off, as my HTML handles that.
Make the tone incredibly gentle, using "I feel" statements. It should sound genuine, supportive, and seeking understanding rather than blame. Break it into 2 or 3 short paragraphs. No markdown formatting like asterisks or bold text, just raw text.`;

            
            const response = await fetch("https://api.deepseek.com/chat/completions", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${modelConfig.key}`
                },
                body: JSON.stringify({
                    model: modelConfig.name,
                    messages: [
                        { role: "system", content: "You are a warm, healing mental health companion." },
                        { role: "user", content: prompt }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error("API request failed.");
            }

            const data = await response.json();
            const replyText = (data.choices?.[0]?.message?.content || '').trim();
            if (!replyText) throw new Error("Empty model response.");

            // Populate the letter
            const currentDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            letterDate.textContent = currentDate;
            letterSalutation.textContent = `Dear ${recipient},`;
            
            // Format body paragraphs securely
            letterBody.innerHTML = '';
            const paragraphs = replyText.split('\\n').filter(p => p.trim() !== '');
            paragraphs.forEach(pText => {
                const p = document.createElement('p');
                p.textContent = pText;
                letterBody.appendChild(p);
            });

            letterClosing.textContent = 'With love,';
            letterSender.textContent = sender;

            // Display outcome
            generatorPreviewArea.style.display = 'block';
            generatorPreviewArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            console.error("Letter generation error:", error);
            alert("Oops, something went wrong while generating the letter. Please try again.");
        } finally {
            generateBtn.disabled = false;
            generateBtn.style.opacity = '1';
            loadingIndicator.style.display = 'none';
        }
    });

    downloadPdfBtn.addEventListener('click', async () => {
        const letterElement = document.getElementById('letter-document');
        
        try {
            // Store original inline styles and modify for PDF capturing specifically
            const originalTransform = letterElement.style.transform;
            const originalShadow = letterElement.style.boxShadow;
            
            // Temporarily normalize for clean capture
            letterElement.style.transform = 'none';
            letterElement.style.boxShadow = 'none';
            // Slight upscale for better PDF resolution
            const scale = 2;

            const canvas = await html2canvas(letterElement, {
                scale: scale,
                useCORS: true,
                backgroundColor: '#faf8f4' // Warm paper background color
            });

            // Revert styles
            letterElement.style.transform = originalTransform;
            letterElement.style.boxShadow = originalShadow;

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            
            // Calculate PDF dimensions (A4 size: 210 x 297 mm)
            const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('MainVoice_Letter.pdf');
            
        } catch (err) {
            console.error('PDF Generation Error:', err);
            alert('There was an error generating your PDF.');
        }
    });
});
