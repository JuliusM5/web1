import React, { useState } from 'react';
import { useI18n } from '../../utils/i18n'; // Import the i18n hook

function PhotosTab({ 
  photoUrl, setPhotoUrl, photoCaption, setPhotoCaption,
  photos, setPhotos, addPhoto
}) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState('');
  const { t } = useI18n(); // Use the i18n hook
  
  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setUploadPreview(previewUrl);
      
      // Set the photo caption to the file name by default (without extension)
      const fileName = file.name.split('.').slice(0, -1).join('.');
      setPhotoCaption(fileName);
    }
  };
  
  // Add uploaded photo
  const addUploadedPhoto = () => {
    if (!uploadedFile) return;
    
    const newPhoto = {
      id: Date.now(),
      url: uploadPreview,
      caption: photoCaption,
      isLocal: true,
      file: uploadedFile
    };
    
    setPhotos([...photos, newPhoto]);
    
    // Reset state
    setUploadedFile(null);
    setUploadPreview('');
    setPhotoCaption('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold mb-3">{t('photos.addPhotos', 'Add Photos')}</h3>
        
        {/* Upload from device */}
        <div className="space-y-3 bg-white border border-gray-200 p-4 rounded-lg mb-4">
          <h4 className="font-medium text-gray-700">{t('photos.uploadFromDevice', 'Upload from Device')}</h4>
          
          <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center">
            {uploadPreview ? (
              <div className="mb-3">
                <img 
                  src={uploadPreview} 
                  alt={t('photos.preview', 'Preview')} 
                  className="h-40 mx-auto object-contain" 
                />
              </div>
            ) : (
              <div className="py-4">
                <span className="block text-gray-500 mb-2">{t('photos.selectImageFile', 'Select an image file')}</span>
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
              aria-label={t('photos.chooseFile', 'Choose file')}
            />
          </div>
          
          {uploadPreview && (
            <>
              <div>
                <label className="block text-gray-700 mb-1 text-sm">{t('photos.caption', 'Caption')}</label>
                <input
                  type="text"
                  value={photoCaption}
                  onChange={e => setPhotoCaption(e.target.value)}
                  placeholder={t('photos.captionPlaceholder', 'Description of the photo')}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <button
                onClick={addUploadedPhoto}
                className="w-full py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                {t('photos.addPhoto', 'Add Photo')}
              </button>
            </>
          )}
        </div>
        
        <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
          <h4 className="font-semibold text-yellow-800">{t('photos.galleryTips', 'Photo Gallery Tips:')}</h4>
          <ul className="mt-1 ml-4 list-disc text-yellow-800">
            <li>{t('photos.tip1', 'Upload photos of places you want to visit')}</li>
            <li>{t('photos.tip2', 'Add inspirational travel images from your device')}</li>
            <li>{t('photos.tip3', 'Include photos of important documents like tickets')}</li>
            <li>{t('photos.tip4', 'Create a visual wishlist for your trip')}</li>
          </ul>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-3">{t('photos.yourPhotos', 'Your Photos')}</h3>
        
        {photos.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-gray-500">{t('photos.noPhotos', 'No photos added yet.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {photos.map(photo => (
              <div key={photo.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="relative">
                  <img 
                    src={photo.url} 
                    alt={photo.caption || t('photos.travelInspiration', 'Travel inspiration')}
                    className="w-full h-36 object-cover"
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = "/api/placeholder/300/200";
                    }}
                  />
                  <button
                    onClick={() => setPhotos(photos.filter(p => p.id !== photo.id))}
                    className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                    aria-label={t('photos.remove', 'Remove')}
                  >
                    ✕
                  </button>
                </div>
                {photo.caption && (
                  <div className="p-2 text-sm">
                    {photo.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PhotosTab;