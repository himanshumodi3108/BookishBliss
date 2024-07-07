import React, { useState } from 'react';
import { useLoaderData, useParams } from 'react-router-dom';
import { Button, Label, TextInput, Textarea, Select } from "flowbite-react";

const EditBooks = () => {
  const {id} = useParams();
  const {bookTitle, authorName, imageURL, category, bookDescription, bookPDFURL, price} = useLoaderData();
  //console.log(bookTitle);


  const bookCategories = [
    "Fiction",
    "Non-Fiction",
    "Mystery",
    "Programming",
    "Science Fiction",
    "Fantasy",
    "Horror",
    "Bibliography",
    "Romance",
    "Autobiography",
    "History",
    "Self-help",
    "Memoir",
    "Business",
    "Children Books",
    "Travel",
    "Religion",
    "Art and Design"
  ]

  const [selectedBookCategory, setSelectedBookCategory] = useState(bookCategories[0]);

  const handleChangeSelectedValue = (event) => {
    //console.log(event.target.value);
    setSelectedBookCategory(event.target.value);
  }

  //Handle Book Upload
  const handleUpdate = (event) => {
    event.preventDefault();
    const form = event.target;

    const bookTitle = form.bookTitle.value;
    const authorName = form.authorName.value;
    const imageURL = form.imageURL.value;
    const category = form.categoryName.value;
    const bookDescription = form.bookDescription.value;
    const bookPDFURL = form.bookPDFURL.value;
    const price = form.price.value;

    const updateBookObj = {
      bookTitle, authorName, imageURL, category, bookDescription, bookPDFURL, price
    }
    //console.log(bookObj);

    //Update book data
    fetch(`http://localhost:5000/book/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updateBookObj)
    }).then(res => res.json()).then(data => {
      //console.log(data);
      alert("Book Updated Successfully!!!")
    })
    
  }


  return (
    <div className='px-4 my-12'>
      <h2 className='mb-8 text-3xl font-bold'>Update the book data</h2>
      <form onSubmit={handleUpdate} className="flex lg:w-[1180px] flex-col flex-wrap gap-4">
        {/* First Row */}
        <div className='flex gap-8'>
          {/* Book Title */}
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="bookTitle" value="Book Title" />
            </div>
            <TextInput id="bookTitle" type="text" placeholder="Enter the Book Name" name="bookTitle" defaultValue={bookTitle} required />
          </div>
          {/* Author Name */}
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="authorName" value="Author Name" />
            </div>
            <TextInput id="authorName" type="text" placeholder="Enter the Author Name" name="authorName" defaultValue={authorName} required />
          </div>
        </div>

        {/* Second Row */}
        <div className='flex gap-8'>
          {/* Image URL */}
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="imageURL" value="Image URL" />
            </div>
            <TextInput 
              id="imageURL" 
              type="text" 
              placeholder="Enter the Book Image URL" 
              name="imageURL"
              defaultValue={imageURL} 
              required 
            />
          </div>
          {/* Category */}
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="inputState" value="Book Category" />
            </div>
            <Select 
              name="categoryName" 
              id="inputState" 
              className='w-full rounded' 
              value={selectedBookCategory}
              defaultValue={category}
              onChange={handleChangeSelectedValue}
            >
              {
                bookCategories.map((option) => <option key={option} value={option}>{option}</option>)
              }
            </Select>
          </div>
        </div>

        {/* Third Row */}
        <div className='flex gap-8'>
          {/* Book PDF URL */}
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="bookPDFURL" value="Book PDF URL" />
            </div>
            <TextInput 
              id="bookPDFURL" 
              type="text" 
              placeholder="Enter the Book PDF URL" 
              name="bookPDFURL"
              defaultValue={bookPDFURL} 
              required 
            />
          </div>

          {/* Book Price */}
          <div className='lg:w-1/2'>
            <div className="mb-2 block">
              <Label htmlFor="price" value="Book Price (in INR)" />
            </div>
            <TextInput 
              id="price" 
              type="text" 
              placeholder="Enter the Book Price in INR" 
              name="price"
              defaultValue={price} 
              required 
            />
          </div>
        </div>

        {/* Book Description */}
        <div>
          <div className="mb-2 block">
            <Label 
              htmlFor="bookDescription" 
              value="Book Description" 
            />
          </div>
          <Textarea 
            id="bookDescription" 
            name="bookDescription" 
            placeholder="Write your book description..." 
            className='w-full'
            defaultValue={bookDescription} 
            required 
            rows={5} 
          />
        </div>

        <Button type="submit" className='mt-5'>Update Book</Button>
      </form>
    </div>
  )
}

export default EditBooks