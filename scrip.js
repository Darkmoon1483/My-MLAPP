// --- Navigation Logic ---
function showPage(pageId) {
    // ซ่อนทุกหน้า
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('active');
    });
    // เอา highlight เมนูออก
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active-link');
    });

    // แสดงหน้าที่เลือก
    setTimeout(() => {
        document.getElementById(pageId).classList.add('active');
    }, 50);

    // Highlight เมนูที่เลือก
    document.getElementById('link-' + pageId).classList.add('active-link');
}

// --- AI Logic (Teachable Machine) ---
const URL = "https://teachablemachine.withgoogle.com/models/MSEfZqPxp/";
let model, maxPredictions;

// เริ่มทำงานทันที
init();

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        const statusLabel = document.getElementById("status");
        statusLabel.innerHTML = "✨ ระบบพร้อมทำงานแล้ว";
        statusLabel.style.color = "#27ae60";
        
        // ปลดล็อกปุ่มเมื่อโมเดลโหลดเสร็จ
        document.getElementById("upload-btn").classList.remove("disabled");
    } catch (error) {
        console.error(error);
        document.getElementById("status").innerText = "เกิดข้อผิดพลาดในการโหลดโมเดล";
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // แจ้งสถานะกำลังคิด
    const resultBox = document.getElementById("result-text");
    resultBox.innerHTML = "⏳ กำลังวิเคราะห์...";
    resultBox.style.color = "#777";

    const reader = new FileReader();
    reader.onload = function(e) {
        const imgElement = document.getElementById("image-preview");
        imgElement.src = e.target.result;

        // เมื่อรูปโหลดเข้า element เสร็จ ให้ส่งไปทำนาย
        imgElement.onload = function() {
            predict();
        }
    };
    reader.readAsDataURL(file);
    
    // Reset input เพื่อให้เลือกไฟล์เดิมซ้ำได้
    event.target.value = ''; 
}

async function predict() {
    const imgElement = document.getElementById("image-preview");
    const prediction = await model.predict(imgElement);
    
    let highestProb = 0;
    let bestClass = "";

    // วนลูปหาค่าที่มากที่สุด
    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > highestProb) {
            highestProb = prediction[i].probability;
            bestClass = prediction[i].className;
        }
    }

    // แสดงผลลัพธ์
    const percentage = (highestProb * 100).toFixed(1);
    const resultHTML = `
        <div>
            คือ <span class="highlight">${bestClass}</span><br>
            <span style="font-size:0.9rem; color:#888;">ความมั่นใจ ${percentage}%</span>
        </div>
    `;
    
    document.getElementById("result-text").innerHTML = resultHTML;
    document.getElementById("result-text").style.color = "#333";
}
