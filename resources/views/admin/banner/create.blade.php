@extends('layouts.load')

@section('content')

<div class="content-area">

    <div class="add-product-content">
        <div class="row">
            <div class="col-lg-12">
                <div class="product-description">
                    <div class="body-area" id="modalEdit">
                        @include('includes.admin.form-error')
                      <form id="geniusformdata" action="{{ route('admin-sb-store') }}" method="POST"
                            enctype="multipart/form-data">
                            {{ csrf_field() }}

                            <div class="row">
                                <div class="col-lg-4">
                                    <div class="left-area">
                                        <h4 class="heading">{{ __('Current Featured Image') }} *</h4>
                                    </div>
                                </div>
                                <div class="col-lg-7">
                                    <div class="img-upload full-width-img">
                                        <div id="image-preview" class="img-preview"
                                            style="background: url({{ asset('assets/admin/images/upload.png') }});">
                                            <label for="image-upload" class="img-label" id="image-label">
                                                <i class="icofont-upload-alt"></i>{{ __('Upload Image') }}
                                            </label>
                                            <input type="file" name="photo" class="img-upload" id="image-upload">
                                        </div>
                                        <p class="text">{{ __('Preferred Size: (1280x600) or Relevant Sized Image') }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <input type="hidden" name="type" value="TopSmall">

                            <div class="row">
                                <div class="col-lg-4">
                                    <div class="left-area">
                                        <h4 class="heading">{{ __('Link') }} *</h4>
                                    </div>
                                </div>
                                <div class="col-lg-7">
                                    <input type="text" class="input-field" name="link" placeholder="{{ __('Link') }}"
                                        value="">
                                </div>
                            </div>

                            <!-- Dropdown for Brands -->
                            <div class="row">
                                <div class="col-lg-4">
                                    <div class="left-area">
                                        <h4 class="heading">{{ __('Select Brand') }} *</h4>
                                    </div>
                                </div>
                                <div class="col-lg-7">
                                    <select name="brand_id" class="input-field">
                                        <option value="">{{ __('Select a Brand') }}</option>
                                        @foreach($brands as $brand)
                                            <option value="{{ $brand->id }}">{{ $brand->brand_name }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-4">
                                    <div class="left-area">
                                    </div>
                                </div>
                                <div class="col-lg-7">
                                    <button class="addProductSubmit-btn"
                                        type="submit">{{ __('Create Banner') }}</button>
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
