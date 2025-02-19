@extends('layouts.load')

@section('content')

<div class="content-area">

  <div class="add-product-content">
    <div class="row">
      <div class="col-lg-12">
        <div class="product-description">
          <div class="body-area" id="modalEdit">
            @include('includes.admin.form-error')
            <form id="Dasformdata" action="{{route('admin-brand-create')}}" method="POST" enctype="multipart/form-data">
              {{csrf_field()}}

              <div class="row">
                <div class="col-lg-4">
                  <div class="left-area">
                    <h4 class="heading">{{ __('Brand Name') }} *</h4>

                  </div>
                </div>
                <div class="col-lg-7">
                  <input type="text" class="input-field" name="brand_name" placeholder="{{ __('Brand') }}" required="" value="">
                </div>
              </div>



              <div class="row">
                <div class="col-lg-4">
                  <div class="left-area">
                    <h4 class="heading">{{ __('Current Featured Image') }} *</h4>
                  </div>
                </div>
                <div class="col-lg-7">
                  <div class="img-upload full-width-img">
                    <div id="image-preview" class="img-preview" style="background: url({{ asset('assets/admin/images/upload.png') }});">
                      <label for="image-upload" class="img-label" id="image-label"><i class="icofont-upload-alt"></i>{{ __('Upload Image') }}</label>
                      <input type="file" name="photo" class="img-upload" id="image-upload">
                    </div>
                    <p class="text">{{ __('Prefered Size: (600x600) or Square Sized Image') }}</p>
                  </div>

                </div>
              </div>


              <div class="row">
                <div class="col-lg-4">
                  <div class="left-area">

                  </div>
                </div>
                <div class="col-lg-7">
                  <button class="addProductSubmit-btn" type="submit">{{ __('Create') }}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

@endsection