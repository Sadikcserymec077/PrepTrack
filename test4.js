fetch('https://piston.website/api/v2/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        language: 'java',
        version: '15.0.2',
        files: [{ name: 'Main.java', content: 'public class Main { public static void main(String[] args) { System.out.println("Hello, World!"); } }' }]
    })
}).then(r => r.json()).then(console.log).catch(console.error);
