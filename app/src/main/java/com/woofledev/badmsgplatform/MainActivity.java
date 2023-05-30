package com.woofledev.badmsgplatform;

import androidx.appcompat.app.AppCompatActivity;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;

public class MainActivity extends AppCompatActivity {
    WebView aView;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        aView = findViewById(R.id.View);
        aView.getSettings().setJavaScriptEnabled(true);
        aView.setWebViewClient(new webClient());
        aView.loadUrl("https://badmsgplatform.glitch.me/app");
    }

    private class webClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            if (url.startsWith("https://badmsgplatform.glitch.me/")) {
                view.loadUrl(url);
                return true;
            } else {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                startActivity(intent);
                return true;
            }
        }
    }
}