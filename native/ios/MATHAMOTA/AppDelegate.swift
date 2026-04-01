import SwiftUI
import WebKit

@main
struct MATHAMOTAApp: App {
    var body: some Scene {
        WindowGroup {
            WebContainer()
        }
    }
}

struct WebContainer: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        if let url = URL(string: "https://your-domain.example") {
            webView.load(URLRequest(url: url))
        }
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

