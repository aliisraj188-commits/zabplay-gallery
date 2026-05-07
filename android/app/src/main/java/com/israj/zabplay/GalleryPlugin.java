package com.israj.zabplay;

import android.Manifest;
import android.content.ContentResolver;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "Gallery",
    permissions = {
        @Permission(strings = { Manifest.permission.READ_EXTERNAL_STORAGE }, alias = "storage"),
        @Permission(strings = { Manifest.permission.READ_MEDIA_IMAGES, Manifest.permission.READ_MEDIA_VIDEO, Manifest.permission.READ_MEDIA_AUDIO }, alias = "media")
    }
)
public class GalleryPlugin extends Plugin {

    @PluginMethod
    public void scan(PluginCall call) {
        if (!hasMediaPermission()) {
            requestAllPermissions(call, "permsCallback");
            return;
        }
        doScan(call);
    }

    @PermissionCallback
    private void permsCallback(PluginCall call) {
        if (hasMediaPermission()) {
            doScan(call);
        } else {
            call.reject("Permission denied");
        }
    }

    private boolean hasMediaPermission() {
        if (Build.VERSION.SDK_INT >= 33) {
            return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_MEDIA_IMAGES) == PackageManager.PERMISSION_GRANTED
                || ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_MEDIA_VIDEO) == PackageManager.PERMISSION_GRANTED
                || ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_MEDIA_AUDIO) == PackageManager.PERMISSION_GRANTED;
        }
        return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
    }

    private void doScan(PluginCall call) {
        JSObject result = new JSObject();
        result.put("photos", query(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "photo"));
        result.put("videos", query(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, "video"));
        result.put("music", query(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, "music"));
        call.resolve(result);
    }

    private JSArray query(Uri uri, String kind) {
        JSArray arr = new JSArray();
        ContentResolver cr = getContext().getContentResolver();
        String[] projection = new String[]{
            MediaStore.MediaColumns._ID,
            MediaStore.MediaColumns.DISPLAY_NAME,
            MediaStore.MediaColumns.SIZE,
            MediaStore.MediaColumns.MIME_TYPE,
            MediaStore.MediaColumns.DATE_ADDED
        };
        try (Cursor c = cr.query(uri, projection, null, null, MediaStore.MediaColumns.DATE_ADDED + " DESC")) {
            if (c == null) return arr;
            int idIdx = c.getColumnIndexOrThrow(MediaStore.MediaColumns._ID);
            int nameIdx = c.getColumnIndexOrThrow(MediaStore.MediaColumns.DISPLAY_NAME);
            int sizeIdx = c.getColumnIndexOrThrow(MediaStore.MediaColumns.SIZE);
            int mimeIdx = c.getColumnIndexOrThrow(MediaStore.MediaColumns.MIME_TYPE);
            int dateIdx = c.getColumnIndexOrThrow(MediaStore.MediaColumns.DATE_ADDED);
            while (c.moveToNext()) {
                long id = c.getLong(idIdx);
                Uri itemUri = Uri.withAppendedPath(uri, String.valueOf(id));
                JSObject o = new JSObject();
                o.put("id", String.valueOf(id));
                o.put("name", c.getString(nameIdx));
                o.put("size", c.getLong(sizeIdx));
                o.put("mimeType", c.getString(mimeIdx));
                o.put("addedAt", c.getLong(dateIdx) * 1000L);
                o.put("url", itemUri.toString());
                o.put("kind", kind);
                arr.put(o);
            }
        } catch (Exception e) {
            // ignore, return what we have
        }
        return arr;
    }
}
