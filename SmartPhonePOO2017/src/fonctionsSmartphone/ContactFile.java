package fonctionsSmartphone;

import java.io.*;
import java.util.*;

public class ContactFile {
	
	/*Permet la sérialisation des contacts*/
	public static void UploadDataContact(ArrayList<Contact> arraylistContact) throws IOException {
		
		for (int i = 0; i < arraylistContact.size(); i++) {
			 FileOutputStream out = new FileOutputStream("./BDDContacts/" + arraylistContact.get(i).getLastname()+arraylistContact.get(i).getFirstname()+".ser");
			 ObjectOutputStream oos = new ObjectOutputStream( out );
			 oos.writeObject(arraylistContact.get(i));
			 oos.close(); 
		}
	}
	
	/*Permet la désérialisation des contacts*/
	public static void DownloadDataContact(String path, ArrayList<Contact> arraylistContact) throws IOException, ClassNotFoundException {
		File folder = new File(path);
		if(folder.isDirectory()==true){
			File[] list = folder.listFiles();
			
			for (int i = 0; i < list.length; i++) {
				
				FileInputStream in = new FileInputStream( "./BDDContacts/" + list[i].getName());
				ObjectInputStream ois = new ObjectInputStream( in );
				arraylistContact.add( (Contact) ois.readObject());
				ois.close(); 	
			}
			
			for (int i = 0; i < list.length; i++) {
				
				list[i].delete();	
			}
		}		
	}
}
