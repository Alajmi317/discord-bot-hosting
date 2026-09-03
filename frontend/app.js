document.getElementById('botForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('botName').value;
  const runtime = document.getElementById('runtime').value;
  const code = document.getElementById('botCode').value;
  const statusDiv = document.getElementById('status');

  statusDiv.innerText = "جاري رفع الكود وتشغيل البوت...";

  try {
    // قم باستبدال الرابط أدناه برابط الـ Backend الخاص بك عند رفعه على سيرفر خارجي
    const response = await fetch('http://localhost:5000/api/bots/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, runtime, code })
    });

    const data = await response.json();
    if (response.ok) {
      statusDiv.innerHTML = `<p style="color: #4ade80;">✅ تم تشغيل البوت بنجاح! ID: ${data.botId}</p>`;
    } else {
      statusDiv.innerHTML = `<p style="color: #f87171;">❌ خطأ: ${data.message}</p>`;
    }
  } catch (err) {
    statusDiv.innerHTML = `<p style="color: #f87171;">❌ تعذر الاتصال بالسيرفر الخلفي!</p>`;
  }
});
