// Using native fetch

async function testRequest() {
  const payload = {
    message: "Begin interview setup.",
    threadId: "debug-thread-" + Date.now(),
  };

  try {
    const response = await fetch('http://localhost:4000/api/interview/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));

    if (data.success) {
      const followUp = {
        message: "no no",
        threadId: payload.threadId,
      };
      console.log("Sending follow-up...");
      const res2 = await fetch('http://localhost:4000/api/interview/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUp)
      });
      const data2 = await res2.json();
      console.log("Follow-up Response:", JSON.stringify(data2, null, 2));
    }
  } catch (error) {
    console.error("Request Error:", error);
  }
}

testRequest();
