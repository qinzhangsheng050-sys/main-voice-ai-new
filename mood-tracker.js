/**
 * Mood Tracker Logic
 * Handles saving daily moods to localStorage, drawing simple line charts,
 * and generating an AI analysis based on psychological research methods.
 */

document.addEventListener('DOMContentLoaded', () => {
    const moodScaleContainer = document.getElementById('mood-scale-container');
    const moodNote = document.getElementById('mood-note');
    const saveMoodBtn = document.getElementById('save-mood-btn');
    const saveMsg = document.getElementById('save-msg');
    
    const generateReportBtn = document.getElementById('generate-report-btn');
    const aiReportContent = document.getElementById('ai-report-content');
    const reportLoading = document.getElementById('report-loading');
    const canvas = document.getElementById('mood-chart');
    const noDataMsg = document.getElementById('no-data-msg');
    
    let selectedScore = null;
    
    // Emojis for 1-10
    const moodEmojis = ['😭', '😢', '🙁', '😕', '😐', '🙂', '😌', '😊', '😁', '🤩'];
    
    /** ========================
     *  INIT UI
     *  ======================== **/
    // Generate mood buttons
    if (moodScaleContainer) {
        for (let i = 1; i <= 10; i++) {
            const btn = document.createElement('button');
            btn.className = 'mood-btn';
            btn.innerHTML = `<span class="emoji">${moodEmojis[i-1]}</span><span>${i}</span>`;
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Deselect all
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
                // Select current
                btn.classList.add('selected');
                selectedScore = i;
            });
            
            moodScaleContainer.appendChild(btn);
        }
    }

    /** ========================
     *  STORAGE LOGIC
     *  ======================== **/
    const STORAGE_KEY = 'mainvoice_mood_history';

    function getHistory() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    function saveEntry(score, note) {
        const history = getHistory();
        const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Update today's entry if it exists, otherwise append
        const existingIndex = history.findIndex(entry => entry.date === dateStr);
        const newEntry = {
            date: dateStr,
            score: score,
            note: note,
            timestamp: Date.now()
        };

        if (existingIndex >= 0) {
            history[existingIndex] = newEntry;
        } else {
            history.push(newEntry);
        }
        
        // Keep last 30 days
        if (history.length > 30) history.shift();
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }

    if (saveMoodBtn) {
        saveMoodBtn.addEventListener('click', () => {
            if (selectedScore === null) {
                alert('Please select a mood score before saving.');
                return;
            }
            saveEntry(selectedScore, moodNote.value.trim());
            
            saveMsg.style.display = 'block';
            setTimeout(() => {
                saveMsg.style.display = 'none';
            }, 3000);
            
            drawChart(); // update chart immediately
        });
    }

    /** ========================
     *  CHART LOGIC
     *  ======================== **/
    function drawChart() {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const history = getHistory();
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (history.length === 0) {
            if (noDataMsg) noDataMsg.style.display = 'block';
            return;
        } else {
            if (noDataMsg) noDataMsg.style.display = 'none';
        }

        // Get up to last 7 days
        const last7 = history.slice(-7);
        
        const padding = 40;
        const graphWidth = canvas.width - padding * 2;
        const graphHeight = canvas.height - padding * 2;
        
        // Draw grid lines
        ctx.strokeStyle = 'rgba(107, 143, 113, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 1; i <= 10; i++) {
            const y = canvas.height - padding - (i / 10) * graphHeight;
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            
            // Labels
            if (i === 1 || i === 5 || i === 10) {
                ctx.fillStyle = '#6a7560';
                ctx.font = '12px "DM Sans"';
                ctx.textAlign = 'right';
                ctx.fillText(i, padding - 10, y + 4);
            }
        }
        ctx.stroke();

        // Draw data line
        if (last7.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = '#6b8f71';
            ctx.lineWidth = 3;
            ctx.lineJoin = 'round';
            
            const stepX = last7.length > 1 ? graphWidth / (last7.length - 1) : graphWidth / 2;
            
            last7.forEach((entry, index) => {
                const x = padding + (last7.length > 1 ? index * stepX : stepX);
                const y = canvas.height - padding - (entry.score / 10) * graphHeight;
                
                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
            
            // Draw points
            last7.forEach((entry, index) => {
                const x = padding + (last7.length > 1 ? index * stepX : stepX);
                const y = canvas.height - padding - (entry.score / 10) * graphHeight;
                
                ctx.beginPath();
                ctx.fillStyle = '#fff';
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                
                // Date labels
                ctx.fillStyle = '#6a7560';
                ctx.font = '11px "DM Sans"';
                ctx.textAlign = 'center';
                const dateLabel = new Date(entry.date).toLocaleDateString('en-US', {weekday: 'short', month:'short', day:'numeric'});
                ctx.fillText(dateLabel, x, canvas.height - 15);
            });
            
            // Gradient fill under the line
            if (last7.length > 1) {
                const gradient = ctx.createLinearGradient(0, padding, 0, canvas.height - padding);
                gradient.addColorStop(0, 'rgba(107, 143, 113, 0.3)');
                gradient.addColorStop(1, 'rgba(107, 143, 113, 0.0)');
                
                ctx.lineTo(padding + (last7.length - 1) * stepX, canvas.height - padding);
                ctx.lineTo(padding, canvas.height - padding);
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }
    }

    // Initial draw
    drawChart();

    /** ========================
     *  AI REPORT LOGIC
     *  ======================== **/
    if (generateReportBtn && window.MainVoiceAI) {
        generateReportBtn.addEventListener('click', async () => {
            const history = getHistory().slice(-7); // Last 7 days
            if (history.length === 0) {
                alert('Please track your mood for at least one day before generating a report.');
                return;
            }

            generateReportBtn.disabled = true;
            generateReportBtn.innerHTML = 'Generating... <span class="typing-dot" style="animation:none"></span>';
            aiReportContent.style.display = 'none';
            reportLoading.style.display = 'block';

            // Construct summary
            let summaryStr = `User's last 7 days of mood (1-10 scale):\n`;
            let total = 0;
            history.forEach(h => {
                summaryStr += `- ${h.date}: Score ${h.score}. Note: ${h.note || 'None'}\n`;
                total += h.score;
            });
            
            const avg = (total / history.length).toFixed(1);
            summaryStr += `\nAverage: ${avg}/10.\n`;

            const systemInstruction = `You are a warm, empathetic, and evidence-based CBT AI therapist. 
The user is requesting a "Weekly Mood Report".
Please analyze the following mood data:
${summaryStr}

Output format requirements:
Write it in properly formatted Markdown.
Include these sections:
1. **Mood Trend & Reflection**: A gentle analysis of their average score and any visible trends. Be encouraging. 
2. **Psychological Insights (Evidence-based)**: Relate their experience to modern psychological research on youth mental health, specifically mentioning one or more of these studies naturally: Twenge (2018) on digital media and wellbeing, Leung (2016) on stress and coping, or Hankin (2001) on cognitive vulnerabilities and stress. 
3. **Actionable CBT/Mindfulness Steps**: Offer 1-2 small, personalized coping strategies or behavioral activation tips based on their notes.
4. **Warm Encouragement**: Conclude with a supportive, comforting message.

Keep the tone like a caring human friend, not a cold clinical tool. Keep it concise but meaningful.`;

            try {
                let reportMarkdown = "";
                const aiEngine = window.MainVoiceAI;
                const modelConfig = aiEngine?.currentModel === 'pro' ? aiEngine.models.pro : aiEngine.models.flash;
                
                // Helper to format straightforward text response
                const response = await fetch("https://api.deepseek.com/chat/completions", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${modelConfig.key}`
                    },
                    body: JSON.stringify({
                        model: modelConfig.name,
                        messages: [
                            { role: "system", content: systemInstruction },
                            { role: "user", content: "Please generate my weekly mood report." }
                        ]
                    })
                });
                if (!response.ok) throw new Error("API Error");
                const data = await response.json();
                reportMarkdown = data.choices[0].message.content;

                // Simple Markdown to HTML parser for the report display
                let htmlContent = reportMarkdown
                    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                    .replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>')
                    .replace(/<\/ul>\n<ul>/gim, '')
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\n/g, '<br>');
                
                htmlContent = `<p>${htmlContent}</p>`; // Wrap initially
                
                reportLoading.style.display = 'none';
                aiReportContent.innerHTML = htmlContent;
                aiReportContent.style.display = 'block';
                
                const downloadBtn = document.getElementById('download-report-btn');
                if (downloadBtn) downloadBtn.style.display = 'flex';

            } catch (err) {
                console.error(err);
                reportLoading.style.display = 'none';
                aiReportContent.innerHTML = `<p style="color:var(--color-coral)">I'm so sorry, I had trouble connecting to the network to generate your report. Please try again later. Your data is still safe locally.</p>`;
                aiReportContent.style.display = 'block';
            } finally {
                generateReportBtn.disabled = false;
                generateReportBtn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    Refresh Insights
                `;
            }
        });
    }

    const downloadReportBtn = document.getElementById('download-report-btn');
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', async () => {
            if (!window.jspdf || !window.html2canvas) {
                alert("PDF libraries are still loading. Please try again in a few seconds.");
                return;
            }

            const downloadOriginalText = downloadReportBtn.innerHTML;
            downloadReportBtn.innerHTML = "Generating PDF... <span class='typing-dot'></span>";
            downloadReportBtn.disabled = true;

            const targetElement = document.getElementById('report-document');
            
            try {
                // Temporarily adjust styles for clean PDF capture
                const originalBoxShadow = targetElement.style.boxShadow;
                targetElement.style.boxShadow = 'none';

                const canvas = await html2canvas(targetElement, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#faf8f4' // Warm paper background color
                });

                targetElement.style.boxShadow = originalBoxShadow;

                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                
                const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                let heightLeft = pdfHeight;
                let position = 0;

                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - pdfHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
                    heightLeft -= pageHeight;
                }

                pdf.save('MainVoice_Mood_Weekly_Report.pdf');
                
            } catch (err) {
                console.error('PDF Generation Error:', err);
                alert('There was an error generating your PDF.');
            } finally {
                downloadReportBtn.innerHTML = downloadOriginalText;
                downloadReportBtn.disabled = false;
            }
        });
    }
});
