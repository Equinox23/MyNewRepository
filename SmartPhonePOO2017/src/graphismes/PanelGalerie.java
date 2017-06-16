package graphismes;

import java.awt.BorderLayout;
import java.awt.CardLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.geom.AffineTransform;
import java.awt.image.AffineTransformOp;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

import javax.imageio.ImageIO;
import javax.swing.*;

import Fonctions.ImageGalerie;
import Fonctions.PanGalerieTop;
import Fonctions.PanImageList;


public class PanelGalerie extends JPanel implements ActionListener  {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	JFileChooser chooser;
	static BufferedImage image;
	Icon redim;
	JButton buttonAjouterImage;	
	static JButton buttonLieContact;	
	static JButton buttonLieNewContact;
	String path;
	JLabel photos;
	
	public static PanGalerieTop miniature;
	public static JPanel boutons;
	public static PanGalerieTop panImageView = new PanGalerieTop();
	public static PanGalerieTop panManager = new PanGalerieTop();
	
	public static PanImageList panImageList = new PanImageList();
	public static PanGalerieTop panImageListTM= new PanGalerieTop();;
	
	public static JButton btnLBLZoom = new JButton();	
	public static CardLayout cl = new CardLayout();
	public static String[] listPanel = { "ImageList", "ImageView" };

	public static boolean played= false;
	//public static Thread t = new Thread(new PlayDiaporama());

	public PanelGalerie() {
		super();
		this.setBackground(new Color(0,0,0,150));
		this.setBounds(15, 15, 400, 650);		
		this.setVisible(false);
		this.setLayout(null);
		
		panImageListTM.setLayout(new BorderLayout());
		panImageListTM.add(panImageList,BorderLayout.CENTER);

		panImageView.setLayout(new FlowLayout(FlowLayout.CENTER));
		panImageView.add(btnLBLZoom);

		panManager.setLayout(cl);
		panManager.add(panImageListTM, listPanel[0]);
		panManager.add(panImageView, listPanel[1]);
		this.add(panManager);
		setSizeGUI();
		setImageCard(0);
		btnLBLZoom.addActionListener(new clic_btnLBLZoom());
		
	// panel avec boutons
		boutons = new JPanel();
		boutons.setBackground(new Color(0,0,0,150));
		boutons.setBounds(0, 555, 400, 95);		
		boutons.setVisible(true);
		boutons.setLayout(null);
		this.add(boutons);
		
		/*Création du bouton "Ajouter image"*/
		buttonAjouterImage = new JButton();
		boutons.add(buttonAjouterImage);
		buttonAjouterImage.setBounds(163, 5, 75, 75);
		buttonAjouterImage.setBackground(Color.black);
		buttonAjouterImage.setBorder(null);
		buttonAjouterImage.setIcon(new ImageIcon(MainFrame.class.getResource("/icon/004-technology-2.png")));
		buttonAjouterImage.addMouseListener(new java.awt.event.MouseAdapter() {
		    public void mouseEntered(java.awt.event.MouseEvent e) {
		    	buttonAjouterImage.setBackground(Color.GRAY);
		    }
		    public void mouseExited(java.awt.event.MouseEvent e) {
		    	buttonAjouterImage.setBackground(Color.black);
		    }
		});
		buttonAjouterImage.addActionListener(this);
		
		/*Création du bouton "Ajouter à un contact existant"*/
		buttonLieContact = new JButton("Exist");
		buttonLieContact.setVisible(false);
		boutons.add(buttonLieContact);
		buttonLieContact.setBounds(260, 5, 75, 75);
		buttonLieContact.setBackground(Color.red);
		buttonLieContact.setBorder(null);
		buttonLieContact.addMouseListener(new java.awt.event.MouseAdapter() {
		    public void mouseEntered(java.awt.event.MouseEvent e) {
		    	buttonLieContact.setBackground(Color.GRAY);
		    }
		    public void mouseExited(java.awt.event.MouseEvent e) {
		    	buttonLieContact.setBackground(Color.red);
		    }
		});
		buttonLieContact.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				MainFrame.panelModifDeleteContact.setVisible(true);
				MainFrame.galeriePhoto.setVisible(false);
				MainFrame.profilpicture2.setIcon(ImageGalerie.getImgIcon());

			}
		});
		
		/*Création du bouton "Ajouter à un nouveau contact"*/
		buttonLieNewContact = new JButton("Nouv");
		buttonLieNewContact.setVisible(false);
		boutons.add(buttonLieNewContact);
		buttonLieNewContact.setBounds(260, 5, 75, 75);
		buttonLieNewContact.setBackground(Color.red);
		buttonLieNewContact.setBorder(null);
		buttonLieNewContact.addMouseListener(new java.awt.event.MouseAdapter() {
		    public void mouseEntered(java.awt.event.MouseEvent e) {
		    	buttonLieNewContact.setBackground(Color.GRAY);
		    }
		    public void mouseExited(java.awt.event.MouseEvent e) {
		    	buttonLieNewContact.setBackground(Color.red);
		    }
		});
		buttonLieNewContact.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				MainFrame.panelNewContact.setVisible(true);
				MainFrame.galeriePhoto.setVisible(false);
				MainFrame.profilpicture1.setIcon(ImageGalerie.getImgIcon());
			}
		});
	}
	
	public static void setImageCard(int i) {
		cl.show(panManager, listPanel[i]);
	}
	
	public  void setSizeGUI(){
		// sauve l'index en cours avant de refaire la grille 
		int saveNdx = MainFrame.galerie.getNdxEnCours();
		panImageList.setSizeGUI();//.repaintPanImageList();
		panImageList.ajouterListener();
		repaintPanImageView(saveNdx);
		panManager.setPreferredSize(new Dimension(10,10));
	}

	public static void repaintPanImageView(int index) {
		played=false;
		afficherImageZoom(index);
	}
	
	public static void afficherImageZoom(int index) {
		Dimension dimPicture = new Dimension(400,650);
		PanelGalerie.btnLBLZoom.setPreferredSize(dimPicture);
		MainFrame.galerie.picture.setZoomAuto(false);
		MainFrame.galerie.picture.setDimIcon(dimPicture);
		MainFrame.galerie.setPicture(index);
		PanelGalerie.btnLBLZoom.setIcon(MainFrame.galerie.picture.getImgIcon());
		MainFrame.galerie.picture.setZoomAuto(true);
	}      
	
	public static class clic_btnLBLZoom implements ActionListener {
		public void actionPerformed(ActionEvent e) {
			PanelGalerie.repaintPanImageView(0);
			PanelGalerie.setImageCard(0);
		}
	}
	
	
	
		/*lecteur d'image"*/	
		public void actionPerformed(ActionEvent e) {
			int result;   			
			chooser = new JFileChooser();
			chooser.setCurrentDirectory(new java.io.File(".","imagesGalerie"));
			chooser.setFileSelectionMode(JFileChooser.FILES_AND_DIRECTORIES);
  
	         if (chooser.showOpenDialog(this) == JFileChooser.APPROVE_OPTION) {
	        	 File file = chooser.getSelectedFile();	        	 
	        	 try {
	        		 PanelGalerie.image=ImageIO.read(file);	
	        		 this.path=file.getAbsolutePath();	
	        		 photos=new JLabel();
	        		 photos.setBounds(100, 10, PanelGalerie.scale(PanelGalerie.image,25).getWidth(null), PanelGalerie.scale(PanelGalerie.image,25).getHeight(null));
	                 
	                 photos.setIcon(new ImageIcon(PanelGalerie.scale(PanelGalerie.image,25)));
	                 photos.setIcon(new ImageIcon(image));
	                 miniature.add(photos);
                 
	         
				} catch (Exception e2) {
					// TODO: handle exception
				}
	        	 
                 System.out.println("getSelectedFile() : "
	                  +  chooser.getSelectedFile());   
	               }
	             else {
	               System.out.println("Pas de fichier séléctioné ");
	               }          
	    	}
		public static BufferedImage read(File input) throws IOException {
			return image;
		}
		
		public static BufferedImage scale(BufferedImage img, double scaleValue) {
		        AffineTransform tx = new AffineTransform();
		        tx.scale(scaleValue, scaleValue);
		        AffineTransformOp op = new AffineTransformOp(tx,AffineTransformOp.TYPE_BILINEAR);
		        BufferedImage imgNew = new BufferedImage( (int) (img.getWidth() * scaleValue),
		                (int) (img.getHeight() * scaleValue),
		                img.getType());
		        return op.filter(img, imgNew);
	 }	
		 

}


	
