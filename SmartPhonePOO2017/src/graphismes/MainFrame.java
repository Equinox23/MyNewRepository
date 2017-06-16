package graphismes;

import java.awt.*;
import java.awt.event.*;
import java.io.IOException;
import java.util.ArrayList;
import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.event.ListSelectionEvent;
import javax.swing.event.ListSelectionListener;

import Fonctions.ImageGalerie;
import Fonctions.MyListGalerie;

import fonctionsSmartphone.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class MainFrame {
	
	protected JFrame frameSmartphone;

	public static JScrollPane scrollPane;
	public static JList<Contact> listContact;
	public static MyListGalerie galerie = new MyListGalerie("./ImagesGalerie");

	
	private JPanel panelContact;
	private JPanel panelMenu;
	protected static JPanel panelNewContact;
	protected static JPanel panelModifDeleteContact;
	private JPanel topMenu;
	protected static JPanel galeriePhoto;

	private JLabel fondEcran;
	private JLabel labelFirstName1;
	private JLabel labelLastName1;
	private JLabel labelFirstName2;
	private JLabel labelLastName2;
	private JLabel labelphonenumber1;
	private JLabel labelphonenumber2;
	private JLabel labelemail1;
	private JLabel labelemail2;
	private JLabel heuretelephone;
	private JLabel heuretelephonepetit;
	private JLabel photo1;
	private JLabel photo2;
	private JLabel test;
	
	private JScrollPane listScroller;
	
	private JTextField firstNamef1;
	private JTextField lastNamef1;
	private JTextField firstNamef2;
	private JTextField lastNamef2;
	private JTextField phonenumber1;
	private JTextField phonenumber2;
	private JTextField email1;
	private JTextField email2;
	
	private JButton buttonMenu;
	private JButton buttonFermer;
	private JButton buttonVerrouiller;
	private JButton buttonGaleriePhoto;
	private JButton buttonContact;
	private JButton buttonAjouterContact;
	private JButton buttonSave;
	private JButton buttonDelete;
	private JButton buttonModify;
	private JButton cancelNewContact;
	private JButton cancelModification;
	protected static JButton profilpicture1;
	protected static JButton profilpicture2;
	private JButton newprofilpicture1;
	private JButton newprofilpicture2;
		
	private Font font;
	private Font fontBold;
	private Font fontHeure;
	private Font fontHeurepetit;
	
	private JList jlistContact ;
	protected static Contact newContact;
	
	protected static int contactencours;
	
	public MainFrame() throws ClassNotFoundException, IOException {
		
		ArrayList<Contact> arraylistContact = new ArrayList<Contact>();
		
		ContactFile.DownloadDataContact("./BDDContacts",arraylistContact);
		
		jlistContact = new JList(arraylistContact.toArray());
		
		newContact = new Contact();
		
		font = new Font("Roboto", Font.PLAIN, 15);
		fontBold = new Font("Roboto", Font.BOLD, 15);
		fontHeure = new Font("Roboto", Font.BOLD, 60);
		fontHeurepetit = new Font("Roboto", Font.BOLD, 18);
		
		/*Définition de la trame de fond*/
		frameSmartphone = new JFrame();
		frameSmartphone.setResizable(false);
		frameSmartphone.getContentPane().setBackground(Color.BLACK);
		frameSmartphone.setSize(430,750);
		frameSmartphone.setUndecorated(true);
		frameSmartphone.setLocationRelativeTo(null);		
		frameSmartphone.getContentPane().setLayout(null);
				
/*-------------------------------------------------------------------------------------------------------------------*/
/*CREATION DE TOUS LES PANELS*/
/*-------------------------------------------------------------------------------------------------------------------*/
		
	/*Création du menu de base*/
		panelMenu = new JPanel();
		panelMenu.setBackground(new Color(0,0,0,150));
		panelMenu.setBounds(15, 45, 400, 630);
		frameSmartphone.getContentPane().add(panelMenu);
		panelMenu.setVisible(false);
		
	/*Création du top menu*/
		topMenu = new JPanel();
		topMenu.setBackground(Color.WHITE);
		topMenu.setBounds(15, 15, 400, 30);
		frameSmartphone.getContentPane().add(topMenu);
		topMenu.setVisible(false);
		
	/*Création du panel contact*/
		panelContact = new JPanel();
		panelContact.setBackground(new Color(0,0,0,150));
		panelContact.setBounds(15, 45, 400, 620);
		frameSmartphone.getContentPane().add(panelContact);
		panelContact.setVisible(false);
		panelContact.setLayout(null);
		
	/*Création du panel nouveau contact*/
		panelNewContact = new JPanel();
		panelNewContact.setBackground(new Color(0,0,0,150));
		frameSmartphone.getContentPane().add(panelNewContact);
		panelNewContact.setVisible(false);
		panelNewContact.setLayout(null);
		panelNewContact.setBounds(15, 45, 400, 620);
		
	/*Création du panel modifier un contact*/
		panelModifDeleteContact = new JPanel();
		panelModifDeleteContact.setBackground(new Color(0,0,0,150));
		frameSmartphone.getContentPane().add(panelModifDeleteContact);
		panelModifDeleteContact.setVisible(false);
		panelModifDeleteContact.setLayout(null);
		panelModifDeleteContact.setBounds(15, 45, 400, 620);
		
	/*Création du panel galerie photo*/
		galeriePhoto = new JPanel();
		galeriePhoto.setBackground(new Color(0,0,0,150));
		galeriePhoto.setBounds(15, 45, 400, 620);

		//final JPanel galeriePhoto = new JPanel();
		galeriePhoto = new PanelGalerie();
		frameSmartphone.getContentPane().add(galeriePhoto);
		
		fondEcran = new JLabel();
		fondEcran.setBounds(15, 15, 400, 650);
		frameSmartphone.getContentPane().add(fondEcran);
		fondEcran.setIcon(new ImageIcon(MainFrame.class.getResource("/imagesSmartphone/fondEcran.jpg")));
		
/*-------------------------------------------------------------------------------------------------------------------*/
/*CREATION DE TOUT LES CHAMPS*/
/*-------------------------------------------------------------------------------------------------------------------*/
		
	/*Création et ajout de l'heure sur le menu principal*/
		DateTimeFormatter dtf = DateTimeFormatter.ofPattern("HH:mm");
		LocalDateTime now = LocalDateTime.now();
		
		heuretelephone = new JLabel(dtf.format(now), JLabel.CENTER);
		fondEcran.add(heuretelephone);
		heuretelephone.setBounds(0, 150, 400, 60);
		heuretelephone.setForeground(Color.white);
		heuretelephone.setFont(fontHeure);
		
	/*Création et ajout de l'heure sur le top menu*/			
		heuretelephonepetit = new JLabel(dtf.format(now), JLabel.CENTER);
		topMenu.add(heuretelephonepetit);
		heuretelephonepetit.setBounds(0, 0, 400, 30);
		heuretelephonepetit.setForeground(Color.black);
		heuretelephonepetit.setFont(fontHeurepetit);

	/*Création des champs d'ajout de contact*/
		
		/*Prénom*/
		firstNamef1 = new JTextField();
		panelNewContact.add(firstNamef1);
		firstNamef1.setFont(font);
		firstNamef1.setBounds(100, 60, 290, 40);
		
		labelFirstName1 = new JLabel("Prénom");
		labelFirstName1.setFont(fontBold);
		panelNewContact.add(labelFirstName1);
		labelFirstName1.setBounds(10, 60, 100, 40);
		labelFirstName1.setForeground(Color.white);

		/*Nom*/
		lastNamef1 = new JTextField();
		panelNewContact.add(lastNamef1);
		lastNamef1.setFont(font);
		lastNamef1.setBounds(100, 10, 290, 40);
		
		labelLastName1 = new JLabel("Nom");
		labelLastName1.setFont(fontBold);
		panelNewContact.add(labelLastName1);
		labelLastName1.setBounds(10, 10, 100, 40);
		labelLastName1.setForeground(Color.white);
		
		/*Téléphone*/
		phonenumber1 = new JTextField();
		panelNewContact.add(phonenumber1);
		phonenumber1.setFont(font);
		phonenumber1.setBounds(100, 110, 290, 40);
		
		labelphonenumber1 = new JLabel("Téléphone");
		labelphonenumber1.setFont(fontBold);
		panelNewContact.add(labelphonenumber1);
		labelphonenumber1.setBounds(10, 110, 100, 40);
		labelphonenumber1.setForeground(Color.white);
		
		/*Emails*/
		email1 = new JTextField();
		panelNewContact.add(email1);
		email1.setFont(font);
		email1.setBounds(100, 160, 290, 40);
		
		labelemail1 = new JLabel("Email");
		labelemail1.setFont(fontBold);
		panelNewContact.add(labelemail1);
		labelemail1.setBounds(10, 160, 100, 40);
		labelemail1.setForeground(Color.white);
		
		/*Photo*/
		photo1 = new JLabel("Photo");
		photo1.setFont(fontBold);
		panelNewContact.add(photo1);
		photo1.setBounds(10, 210, 100, 40);
		photo1.setForeground(Color.white);
		
	/*Création des champs de modification de contact*/
		
		/*Prénom*/
		firstNamef2 = new JTextField();
		panelModifDeleteContact.add(firstNamef2);
		firstNamef2.setFont(font);
		firstNamef2.setBounds(100, 60, 290, 40);
		
		labelFirstName2 = new JLabel("Prénom");
		labelFirstName2.setFont(fontBold);
		panelModifDeleteContact.add(labelFirstName2);
		labelFirstName2.setBounds(10, 60, 100, 40);
		labelFirstName2.setForeground(Color.white);

		/*Nom*/
		lastNamef2 = new JTextField();
		panelModifDeleteContact.add(lastNamef2);
		lastNamef2.setFont(font);
		lastNamef2.setBounds(100, 10, 290, 40);
		
		labelLastName2 = new JLabel("Nom");
		labelLastName2.setFont(fontBold);
		panelModifDeleteContact.add(labelLastName2);
		labelLastName2.setBounds(10, 10, 100, 40);
		labelLastName2.setForeground(Color.white);
		
		/*Téléphone*/
		phonenumber2 = new JTextField();
		panelModifDeleteContact.add(phonenumber2);
		phonenumber2.setFont(font);
		phonenumber2.setBounds(100, 110, 290, 40);
		
		labelphonenumber2 = new JLabel("Téléphone");
		labelphonenumber2.setFont(fontBold);
		panelModifDeleteContact.add(labelphonenumber2);
		labelphonenumber2.setBounds(10, 110, 100, 40);
		labelphonenumber2.setForeground(Color.white);
		
		/*Emails*/
		email2 = new JTextField();
		panelModifDeleteContact.add(email2);
		email2.setFont(font);
		email2.setBounds(100, 160, 290, 40);
		
		labelemail2 = new JLabel("Email");
		labelemail2.setFont(fontBold);
		panelModifDeleteContact.add(labelemail2);
		labelemail2.setBounds(10, 160, 100, 40);
		labelemail2.setForeground(Color.white);
		
		/*Photo*/
		photo2 = new JLabel("Photo");
		photo2.setFont(fontBold);
		panelModifDeleteContact.add(photo2);
		photo2.setBounds(10, 210, 100, 40);
		photo2.setForeground(Color.white);
		
	/*Création des champs du menu contact*/
		
		/*Insertion de la liste des contacts*/
		panelContact.add(jlistContact);
		jlistContact.setBounds(0, 100, 400, 520);
		jlistContact.setBackground(new Color(215,216,216));
		jlistContact.setFixedCellHeight(45);
		jlistContact.setBorder(new EmptyBorder(0, 10, 0, 10));
		jlistContact.setFont(font);
		
		listScroller = new JScrollPane(jlistContact);
		listScroller.setBounds(0, 100, 400, 520);
		listScroller.getVerticalScrollBar();
		jlistContact.setLayoutOrientation(JList.VERTICAL);
		panelContact.add(listScroller);
		
/*-------------------------------------------------------------------------------------------------------------------*/
/*CREATION DE TOUT LES BOUTONS*/
/*-------------------------------------------------------------------------------------------------------------------*/	
		
		panelMenu.setLayout(null);
		
	/*Création du bouton "Menu"*/
		buttonMenu = new JButton();
		buttonMenu.setBounds(190, 682, 50, 50);
		buttonMenu.setBackground(Color.black);
		buttonMenu.setBorder(null);
		buttonMenu.setIcon(new ImageIcon(MainFrame.class.getResource("/imagesSmartphone/home.png")));
		
		/*Ajout du hover au survol de la souris*/
		buttonMenu.addMouseListener(new java.awt.event.MouseAdapter() {
		    public void mouseEntered(java.awt.event.MouseEvent e) {
		    	buttonMenu.setBackground(Color.GRAY);
		    }
		    public void mouseExited(java.awt.event.MouseEvent e) {
		    	buttonMenu.setBackground(Color.black);
		    }
		});
		
		/*Ajout de l'action du bouton*/
		buttonMenu.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				panelMenu.setVisible(true);
				panelContact.setVisible(false);
				galeriePhoto.setVisible(false);
				panelNewContact.setVisible(false);
				panelModifDeleteContact.setVisible(false);
				heuretelephone.setVisible(false);
				topMenu.setVisible(true);
				PanelGalerie.buttonLieNewContact.setVisible(false);
				PanelGalerie.buttonLieContact.setVisible(false);
			}
		});
		frameSmartphone.getContentPane().add(buttonMenu);
		
	/*Création du bouton "Fermer"*/
		buttonFermer = new JButton();
		buttonFermer.setBounds(280, 682, 50, 50);
		buttonFermer.setBackground(Color.black);
		buttonFermer.setBorder(null);
		buttonFermer.setIcon(new ImageIcon(MainFrame.class.getResource("/imagesSmartphone/shutdown.png")));
		
		/*Ajout du hover au survol de la souris*/
		buttonFermer.addMouseListener(new java.awt.event.MouseAdapter() {
		    public void mouseEntered(java.awt.event.MouseEvent e) {
		    	buttonFermer.setBackground(Color.GRAY);
		    }
		    public void mouseExited(java.awt.event.MouseEvent e) {
		    	buttonFermer.setBackground(Color.black);
		    }
		});
		
		/*Ajout de l'action du bouton*/
		buttonFermer.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent arg0) {
				try {
					ContactFile.UploadDataContact(arraylistContact);
				} catch (IOException e1) {
					e1.printStackTrace();
				}
				System.exit(0);
			}
		});
		frameSmartphone.getContentPane().add(buttonFermer);
		
	/*Création du bouton "Verrouiller"*/
		buttonVerrouiller = new JButton();
		buttonVerrouiller.setBounds(100, 682, 50, 50);
		buttonVerrouiller.setBackground(Color.black);
		buttonVerrouiller.setBorder(null);
		buttonVerrouiller.setIcon(new ImageIcon(MainFrame.class.getResource("/imagesSmartphone/verrouiller.png")));
		
		/*Ajout du hover au survol de la souris*/
		buttonVerrouiller.addMouseListener(new java.awt.event.MouseAdapter() {
		    public void mouseEntered(java.awt.event.MouseEvent e) {
		    	buttonVerrouiller.setBackground(Color.GRAY);
		    }
		    public void mouseExited(java.awt.event.MouseEvent e) {
		    	buttonVerrouiller.setBackground(Color.black);
		    }
		});
		
		/*Ajout de l'action du bouton*/
		buttonVerrouiller.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				panelMenu.setVisible(false);
				panelContact.setVisible(false);
				galeriePhoto.setVisible(false);
				panelNewContact.setVisible(false);
				heuretelephone.setVisible(true);
				topMenu.setVisible(false);
				panelModifDeleteContact.setVisible(false);
			}
		});
		frameSmartphone.getContentPane().add(buttonVerrouiller);
		
	/*Création du bouton "Accès galerie photo"*/
		buttonGaleriePhoto = new JButton();
		buttonGaleriePhoto.setBounds(25, 25, 100, 100);
		buttonGaleriePhoto.setBackground(Color.black);
		buttonGaleriePhoto.setBorder(null);
		buttonGaleriePhoto.setIcon(new ImageIcon(MainFrame.class.getResource("/imagesSmartphone/logoPhoto.png")));
		
		/*Ajout du hover au survol de la souris*/
		buttonGaleriePhoto.addMouseListener(new java.awt.event.MouseAdapter() {
		    public void mouseEntered(java.awt.event.MouseEvent e) {
		    	buttonGaleriePhoto.setBackground(Color.GRAY);
		    }
		    public void mouseExited(java.awt.event.MouseEvent e) {
		    	buttonGaleriePhoto.setBackground(Color.black);
		    }
		});
		
		/*Ajout de l'action du bouton*/
		buttonGaleriePhoto.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				galeriePhoto.setVisible(true);
				panelMenu.setVisible(false);
			}
		});
		panelMenu.add(buttonGaleriePhoto);
		
	/*Création du bouton "Accès aux contacts"*/
		buttonContact = new JButton();
		buttonContact.setBounds(150, 25, 100, 100);
		buttonContact.setBackground(Color.black);
		buttonContact.setBorder(null);
		buttonContact.setIcon(new ImageIcon(MainFrame.class.getResource("/imagesSmartphone/logoContact.png")));
		
		/*Ajout du hover au survol de la souris*/
		buttonContact.addMouseListener(new java.awt.event.MouseAdapter() {
		    public void mouseEntered(java.awt.event.MouseEvent e) {
		    	buttonContact.setBackground(Color.GRAY);
		    }
		    public void mouseExited(java.awt.event.MouseEvent e) {
		    	buttonContact.setBackground(Color.black);
		    }
		});
		
		/*Ajout de l'action du bouton*/
		buttonContact.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				panelContact.setVisible(true);
				panelMenu.setVisible(false);
			}
		});
		panelMenu.add(buttonContact);
		
	/*Création du bouton "Ajouter contact"*/
		buttonAjouterContact = new JButton();
		panelContact.add(buttonAjouterContact);
		buttonAjouterContact.setBounds(10, 10, 75, 75);
		buttonAjouterContact.setBackground(Color.black);
		buttonAjouterContact.setBorder(null);
		buttonAjouterContact.setIcon(new ImageIcon(MainFrame.class.getResource("/imagesSmartphone/addcontact.png")));
		
		/*Ajout du hover au survol de la souris*/
		buttonAjouterContact.addMouseListener(new java.awt.event.MouseAdapter() {
		    public void mouseEntered(java.awt.event.MouseEvent e) {
		    	buttonAjouterContact.setBackground(Color.GRAY);
		    }
		    public void mouseExited(java.awt.event.MouseEvent e) {
		    	buttonAjouterContact.setBackground(Color.black);
		    }
		});
				
		/*Ajout de l'action du bouton*/
		buttonAjouterContact.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				panelNewContact.setVisible(true);
				panelContact.setVisible(false);
			}
		});
		
	/*Création du bouton "Sauvegarder"*/
		buttonSave = new JButton("Sauver");
		buttonSave.setFont(fontBold);
		panelNewContact.add(buttonSave);
		buttonSave.setBounds(10, 560, 380, 50);
		buttonSave.setBackground(Color.green);
		buttonSave.setBorder(null);
		
		/*Ajout du hover au survol de la souris*/
		buttonSave.addMouseListener(new java.awt.event.MouseAdapter() {
		    public void mouseEntered(java.awt.event.MouseEvent e) {
		    	buttonSave.setBackground(Color.GRAY);
		    }
		    public void mouseExited(java.awt.event.MouseEvent e) {
		    	buttonSave.setBackground(Color.green);
		    }
		});
		
		/*Ajout de l'action du bouton*/
		buttonSave.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
					
				newContact.setFirstname(firstNamef1.getText());
				newContact.setLastname(lastNamef1.getText());
				newContact.setPhonenumber(phonenumber1.getText());
				newContact.setEmail(email1.getText());
				newContact.setProfilpicture(ImageGalerie.getNomIcon());
								
				arraylistContact.add(newContact);
				
				/*sérialisation des contacts*/
				try {
					ContactFile.UploadDataContact(arraylistContact);
				} catch (IOException e1) {
					e1.printStackTrace();
				}

				/*Fermeture de la fenêtre actuelle afin de rafraîchir les données de la JList*/
				frameSmartphone.dispose();
				
				/*Nouvelle ouverture du programme et chargement du panelContact*/
				MainFrame mainFrame;
				try {
					mainFrame = new MainFrame();
					mainFrame.frameSmartphone.setVisible(true);
					mainFrame.panelContact.setVisible(true);
					mainFrame.topMenu.setVisible(true);
				} catch (ClassNotFoundException | IOException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}		
			}
		});
		
	/*Ajout de boutons sur le JList des contacts*/
		jlistContact.addListSelectionListener(new ListSelectionListener() {
			@Override
			public void valueChanged(ListSelectionEvent selectedContact) {
				
				contactencours = selectedContact.getLastIndex();
				
				firstNamef2.setText(arraylistContact.get(selectedContact.getLastIndex()).getFirstname());
				lastNamef2.setText(arraylistContact.get(selectedContact.getLastIndex()).getLastname());
				phonenumber2.setText(arraylistContact.get(selectedContact.getLastIndex()).getPhonenumber());
				email2.setText(arraylistContact.get(selectedContact.getLastIndex()).getEmail());
				profilpicture2.setIcon(new ImageIcon((arraylistContact.get(selectedContact.getLastIndex()).getProfilpicture())));

				
				panelModifDeleteContact.setVisible(true);
				panelContact.setVisible(false);
				
			}
		});
		
	/*Création du bouton "Supprimer"*/
		buttonDelete = new JButton("Supprimer");
		buttonDelete.setForeground(Color.white);
		buttonDelete.setFont(fontBold);
		panelModifDeleteContact.add(buttonDelete);
		buttonDelete.setBounds(10, 560, 380, 50);
		buttonDelete.setBackground(Color.red);
		buttonDelete.setBorder(null);
		
		/*Ajout du hover au survol de la souris*/
		buttonDelete.addMouseListener(new java.awt.event.MouseAdapter() {
		    public void mouseEntered(java.awt.event.MouseEvent e) {
		    	buttonDelete.setBackground(Color.GRAY);
		    }
		    public void mouseExited(java.awt.event.MouseEvent e) {
		    	buttonDelete.setBackground(Color.red);
		    }
		});
		
		/*Ajout de l'action du bouton*/
		buttonDelete.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				
				arraylistContact.remove(contactencours);
				
				/*sérialisation des contacts*/
				try {
					ContactFile.UploadDataContact(arraylistContact);
				} catch (IOException e1) {
					e1.printStackTrace();
				}

				/*Fermeture de la fenêtre actuelle afin de rafraîchir les données de la JList*/
				frameSmartphone.dispose();
				
				/*Nouvelle ouverture du programme et chargement du panelContact*/
				MainFrame mainFrame;
				try {
					mainFrame = new MainFrame();
					mainFrame.frameSmartphone.setVisible(true);
					mainFrame.panelContact.setVisible(true);
					mainFrame.topMenu.setVisible(true);
				} catch (ClassNotFoundException | IOException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}		
			}
		});
		
	/*Création du bouton "Modifier"*/
		buttonModify = new JButton("Modifier");
		panelModifDeleteContact.add(buttonModify);
		buttonModify.setFont(fontBold);
		buttonModify.setBounds(10, 500, 380, 50);
		buttonModify.setBackground(Color.green);
		buttonModify.setBorder(null);
		
		/*Ajout du hover au survol de la souris*/
		buttonModify.addMouseListener(new java.awt.event.MouseAdapter() {
		    public void mouseEntered(java.awt.event.MouseEvent e) {
		    	buttonModify.setBackground(Color.GRAY);
		    }
		    public void mouseExited(java.awt.event.MouseEvent e) {
		    	buttonModify.setBackground(Color.green);
		    }
		});
		
		/*Ajout de l'action du bouton*/
		buttonModify.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
						
				newContact.setFirstname(firstNamef2.getText());
				newContact.setLastname(lastNamef2.getText());
				newContact.setPhonenumber(phonenumber2.getText());
				newContact.setEmail(email2.getText());
				newContact.setProfilpicture(ImageGalerie.getNomIcon());
				
				arraylistContact.remove(contactencours);
				arraylistContact.add(newContact);
				
				/*sérialisation des contacts*/
				try {
					ContactFile.UploadDataContact(arraylistContact);
				} catch (IOException e1) {
					e1.printStackTrace();
				}

				/*Fermeture de la fenêtre actuelle afin de rafraîchir les données de la JList*/
				frameSmartphone.dispose();
				
				/*Nouvelle ouverture du programme et chargement du panelContact*/
				MainFrame mainFrame;
				try {
					mainFrame = new MainFrame();
					mainFrame.frameSmartphone.setVisible(true);
					mainFrame.panelContact.setVisible(true);
					mainFrame.topMenu.setVisible(true);
				} catch (ClassNotFoundException | IOException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}		
			}
		});
		
	/*Création du bouton "Annuler" un nouveau contact*/
		cancelNewContact = new JButton("Annuler");
		panelNewContact.add(cancelNewContact);
		cancelNewContact.setFont(fontBold);
		cancelNewContact.setBounds(10, 500, 380, 50);
		cancelNewContact.setBackground(Color.white);
		cancelNewContact.setBorder(null);
		
		/*Ajout du hover au survol de la souris*/
		cancelNewContact.addMouseListener(new java.awt.event.MouseAdapter() {
		    public void mouseEntered(java.awt.event.MouseEvent e) {
		    	cancelNewContact.setBackground(Color.GRAY);
		    }
		    public void mouseExited(java.awt.event.MouseEvent e) {
		    	cancelNewContact.setBackground(Color.white);
		    }
		});
		
		/*Ajout de l'action du bouton*/
		cancelNewContact.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
			
			panelNewContact.setVisible(false);
			panelContact.setVisible(true);
			}
		});
		
	/*Création du bouton "Annuler" une modification/suppression*/
		cancelModification = new JButton("Annuler");
		panelModifDeleteContact.add(cancelModification);
		cancelModification.setFont(fontBold);
		cancelModification.setBounds(10, 440, 380, 50);
		cancelModification.setBackground(Color.white);
		cancelModification.setBorder(null);
		
		/*Ajout du hover au survol de la souris*/
		cancelModification.addMouseListener(new java.awt.event.MouseAdapter() {
		    public void mouseEntered(java.awt.event.MouseEvent e) {
		    	cancelModification.setBackground(Color.GRAY);
		    }
		    public void mouseExited(java.awt.event.MouseEvent e) {
		    	cancelModification.setBackground(Color.white);
		    }
		});
		
		/*Ajout de l'action du bouton*/
		cancelModification.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
					
				panelModifDeleteContact.setVisible(false);
				panelContact.setVisible(true);	
				
				/*sérialisation des contacts*/
				try {
					ContactFile.UploadDataContact(arraylistContact);
				} catch (IOException e1) {
					e1.printStackTrace();
				}

				/*Fermeture de la fenêtre actuelle afin de rafraîchir les données de la JList*/
				frameSmartphone.dispose();
				
				/*Nouvelle ouverture du programme et chargement du panelContact*/
				MainFrame mainFrame;
				try {
					mainFrame = new MainFrame();
					mainFrame.frameSmartphone.setVisible(true);
					mainFrame.panelContact.setVisible(true);
					mainFrame.topMenu.setVisible(true);
				} catch (ClassNotFoundException | IOException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}		
			}
		});
		
	/*Création du bouton "Photo" dans ajout contact*/
		profilpicture1 = new JButton();
		panelNewContact.add(profilpicture1);
		profilpicture1.setBounds(100, 210, 220, 220);
		profilpicture1.setBackground(Color.white);
		profilpicture1.setBorder(null);
		
		/*Ajout de l'action du bouton*/
		profilpicture1.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				
			}
		});
		
	/*Création du bouton "Photo" dans modif/delete contact*/
		profilpicture2 = new JButton();
		panelModifDeleteContact.add(profilpicture2);
		profilpicture2.setBounds(100, 210, 220, 220);
		profilpicture2.setBackground(Color.white);
		profilpicture2.setBorder(null);
		
		/*Ajout de l'action du bouton*/
		profilpicture2.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
						
			}
		});
		
		/*Création du bouton "Photo" dans ajout contact*/
		newprofilpicture1 = new JButton();
		panelNewContact.add(newprofilpicture1);
		newprofilpicture1.setBounds(330, 370, 60, 60);
		newprofilpicture1.setBackground(Color.red);
		newprofilpicture1.setIcon(new ImageIcon(MainFrame.class.getResource("/imagesSmartphone/addPhoto.png")));
		newprofilpicture1.setBorder(null);
		
		/*Ajout du hover au survol de la souris*/
		newprofilpicture1.addMouseListener(new java.awt.event.MouseAdapter() {
		    public void mouseEntered(java.awt.event.MouseEvent e) {
		    	newprofilpicture1.setBackground(Color.GRAY);
		    }
		    public void mouseExited(java.awt.event.MouseEvent e) {
		    	newprofilpicture1.setBackground(Color.red);
		    }
		});
		
		/*Ajout de l'action du bouton*/
		newprofilpicture1.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				
				PanelGalerie.buttonLieNewContact.setVisible(true);
				panelNewContact.setVisible(false);
				galeriePhoto.setVisible(true);	
			}
		});
		
		/*Création du bouton "Photo" dans modif/delete contact*/
		newprofilpicture2 = new JButton();
		panelModifDeleteContact.add(newprofilpicture2);
		newprofilpicture2.setBounds(330, 370, 60, 60);
		newprofilpicture2.setBackground(Color.red);
		newprofilpicture2.setIcon(new ImageIcon(MainFrame.class.getResource("/imagesSmartphone/addPhoto.png")));
		newprofilpicture2.setBorder(null);
		
		/*Ajout du hover au survol de la souris*/
		newprofilpicture2.addMouseListener(new java.awt.event.MouseAdapter() {
		    public void mouseEntered(java.awt.event.MouseEvent e) {
		    	newprofilpicture2.setBackground(Color.GRAY);
		    }
		    public void mouseExited(java.awt.event.MouseEvent e) {
		    	newprofilpicture2.setBackground(Color.red);
		    }
		});
		
		/*Ajout de l'action du bouton*/
		newprofilpicture2.addActionListener(new ActionListener() {
			public void actionPerformed(ActionEvent e) {
				
				PanelGalerie.buttonLieContact.setVisible(true);
				panelModifDeleteContact.setVisible(false);
				galeriePhoto.setVisible(true);
			}
		});
	}
}
	

