<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Datatables;
use App\Models\Brand;
use Validator;

class BrandController extends Controller
{
    //

    public function __construct()
    {
        $this->middleware('auth:admin');
    }


    //*** JSON Request
    public function datatables()
    {
        $datas = Brand::all();
        //--- Integrating This Collection Into Datatables
        return Datatables::of($datas)
            ->addIndexColumn()

            ->editColumn('status', function (Brand $datas) {

                if ($datas->status == 0) {
                    return 'Deactivated';
                }
                return 'Activated';
            })
            ->addColumn('action', function (Brand $data) {
                return '<div class="action-list"><a data-href="' . route('admin-brand-edit', $data->id) . '" class="edit" data-toggle="modal" data-target="#modal1"> <i class="fas fa-edit"></i>Edit</a><a href="javascript:;" data-href="' . route('admin-brand-delete', $data->id) . '" data-toggle="modal" data-target="#confirm-delete" class="delete">Deactive</a><a href="javascript:;" data-href="' . route('admin-brand-activate', $data->id) . '" data-toggle="modal" data-target="#confirm-activate" class="delete">Activate</a></div>';
            })
            ->rawColumns(['action'])
            ->toJson(); //--- Returning Json Data To Client Side
    }

    public function brands()
    {


        return view('admin.brand.index');
    }



    //*** GET Request
    public function create()
    {

        return view('admin.brand.create');
    }

    //*** POST Request
    public function store(Request $request)
    {
        //--- Validation Section
        $rules = ['brand_name' => 'unique:brands'];
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json(array('errors' => $validator->getMessageBag()->toArray()));
        }


        $data = new Brand();
        $input = $request->all();
        if ($file = $request->file('photo')) {
            $name = time() . str_replace(' ', '', $file->getClientOriginalName());
            $file->move('assets/images/partner', $name);
            $input['photo'] = $name;
        }
        $input['brand_name'] =  strtoupper($input['brand_name']);
        $input['brand_code'] = base64_encode(str_replace('%', '', str_replace(' ', '', $input['brand_name'])) . time());
        $data->fill($input)->save();


        //--- Redirect Section
        $msg = 'New Data Added Successfully.';
        return response()->json($msg);
        //--- Redirect Section Ends
    }

    //   //*** GET Request
    public function edit($id)
    {

        $data = Brand::findOrFail($id);
        return view('admin.brand.edit', compact('data'));
    }

    //*** POST Request
    public function update(Request $request, $id)
    {


        $data = Brand::findOrFail($id);
        $input = $request->all();
        if ($file = $request->file('photo')) {
            $name = time() . str_replace(' ', '', $file->getClientOriginalName());
            $file->move('assets/images/partner', $name);
            if ($data->photo != null) {
                if (file_exists(public_path() . '/assets/images/partner/' . $data->photo)) {
                    unlink(public_path() . '/assets/images/partner/' . $data->photo);
                }
            }
            $input['photo'] = $name;
        }


        $input['brand_name'] =  strtoupper($input['brand_name']);
        $data->update($input);
        //--- Logic Section Ends

        //--- Redirect Section
        $msg = 'Data Updated Successfully.';
        return response()->json($msg);
        //--- Redirect Section Ends
    }

    //   //*** GET Request Delete
    public function destroy($id)
    {
        $data = Brand::findOrFail($id);
        $data->status = 0;
        $data->save();
        //--- Redirect Section
        $msg = 'Data Deactivated Successfully.';
        return response()->json($msg);
        //--- Redirect Section Ends
    }

    public function activate($id)
    {
        $data = Brand::findOrFail($id);
        $data->status = 1;
        $data->save();

        // Optionally return a redirect or success message
        return redirect()->route('admin.brands')->with('success', 'Brand activated successfully!');
    }
}
