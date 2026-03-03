fetch('https://api.codex.jaagrav.in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        code: 'public class Main { public static void main(String[] args) { System.out.println("Hello, World!"); } }',
        language: 'java'
    })
}).then(r => r.json()).then(console.log).catch(console.error);
