package Fonctions;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import graphismes.MainFrame;
import graphismes.PanelGalerie;


public class PanImageList extends ImageList {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	public PanImageList(){
		super(new BoutonImg[MainFrame.galerie.getNombreImg()]);
		ajouterListener();
	}
	public void ajouterListener() {
		// Ajouter les listener aux boutons de la gallerie
		for(int i = 0 ; i<tblButtonIMG.length;i++)
			tblButtonIMG[i].addActionListener(new clic_ButtonIMG(i));
	}
	public static class clic_ButtonIMG implements ActionListener {
		int index = 0;
		public clic_ButtonIMG(int i) {
			this.index=i;
		}
		public void actionPerformed(ActionEvent e) {
			PanelGalerie.repaintPanImageView(index);
			PanelGalerie.setImageCard(1);
			
		}
	}
	
}
